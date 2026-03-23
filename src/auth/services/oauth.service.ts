// ============================================================================
// ModularAuth-Kit — OAuth Service
// Implements Google OAuth 2.0 Authorization Code flow with PKCE.
// Direct HTTP calls — no Passport.js (see ADR-004).
// See dev-docs/architecture/oauth-flow.md
// ============================================================================

import { createHash, randomBytes } from 'crypto';

import type { AuthConfig, UserDocument, RequestMeta, LoginEvent } from '../auth.types.js';
import type { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import type { SessionService } from './session.service.js';
import type { LoginHistoryService } from './login-history.service.js';
import type { CreateLoginHistoryData } from '../repositories/interfaces/login-history.repository.interface.js';
import { AuthError } from '../errors/auth-error.js';
import { HTTP_STATUS, ERROR_CODES, LOGIN_EVENTS } from '../auth.constants.js';
import { timingSafeCompare } from '../utils/crypto.js';
import { auditLog } from '../utils/audit-logger.js';

// ============================================================================
// Types
// ============================================================================

/** PKCE + state data stored in a cookie between redirect and callback */
export interface OAuthStateData {
  state: string;
  codeVerifier: string;
}

/** Result from handling the OAuth callback */
export interface OAuthResult {
  user: UserDocument;
  sessionId: string;
  isNewUser: boolean;
}

/** Google's token endpoint response */
interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

/** Decoded Google ID token payload (from tokeninfo endpoint) */
interface GoogleProfile {
  sub: string;           // Google's unique user ID
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

// ============================================================================
// Constants
// ============================================================================

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

// ============================================================================
// OAuth Service Class
// ============================================================================

interface OAuthServiceDeps {
  userRepository: IUserRepository;
  sessionService: SessionService;
  loginHistoryService?: LoginHistoryService;
}

export class OAuthService {
  private readonly userRepo: IUserRepository;
  private readonly sessionService: SessionService;
  private readonly loginHistoryService?: LoginHistoryService;

  constructor(deps: OAuthServiceDeps) {
    this.userRepo = deps.userRepository;
    this.sessionService = deps.sessionService;
    this.loginHistoryService = deps.loginHistoryService;
  }

  // --------------------------------------------------------------------------
  // getAuthorizationUrl
  // --------------------------------------------------------------------------

  /**
   * Build the Google authorization URL with PKCE and state.
   * Returns both the URL and the state data to store in a cookie.
   */
  getAuthorizationUrl(config: AuthConfig): {
    url: string;
    stateData: OAuthStateData;
  } {
    // 1. Generate PKCE code_verifier (43-128 chars, base64url)
    const codeVerifier = randomBytes(32).toString('base64url');

    // 2. Compute code_challenge = base64url(SHA-256(code_verifier))
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // 3. Generate random state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // 4. Build authorization URL
    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: config.google.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent',
    });

    const url = `${GOOGLE_AUTH_URL}?${params.toString()}`;

    return {
      url,
      stateData: { state, codeVerifier },
    };
  }

  // --------------------------------------------------------------------------
  // handleCallback
  // --------------------------------------------------------------------------

  /**
   * Handle the OAuth callback: verify state, exchange code, resolve account.
   */
  async handleCallback(
    code: string,
    receivedState: string,
    storedStateData: OAuthStateData,
    meta: RequestMeta,
    config: AuthConfig,
  ): Promise<OAuthResult> {
    // 1. Verify state matches (CSRF protection) — timing-safe to prevent oracle attacks
    if (!timingSafeCompare(receivedState, storedStateData.state)) {
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        'OAuth state mismatch — possible CSRF attack',
      );
    }

    // 2. Exchange authorization code for tokens
    const tokens = await this.exchangeCode(
      code,
      storedStateData.codeVerifier,
      config,
    );

    // 3. Verify and decode the ID token
    const profile = await this.verifyIdToken(tokens.id_token, config);

    // 4. Account resolution
    const { user, isNewUser } = await this.resolveAccount(profile);

    // 5. Enforce max sessions (if enabled)
    if (config.sessionManagement.enabled) {
      await this.sessionService.enforceMaxSessions(
        user._id.toString(),
        config.sessionManagement.maxActiveSessions,
      );
    }

    // 6. Create session (delegated to SessionService — single source of truth)
    const sessionId = await this.sessionService.create(
      user._id.toString(),
      meta,
      config,
    );

    // 7. Record login history (if enabled)
    if (config.loginHistory.enabled && this.loginHistoryService) {
      await this.recordHistory({
        userId: user._id.toString(),
        event: LOGIN_EVENTS.LOGIN_SUCCESS,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        device: meta.device,
        success: true,
        detail: isNewUser ? 'oauth_new_google_user' : 'oauth_returning_google_user',
      });
    }

    auditLog('oauth_login', {
      userId: user._id.toString(),
      ip: meta.ip,
      success: true,
      detail: isNewUser ? 'new_google_user' : 'returning_google_user',
    });

    return { user, sessionId, isNewUser };
  }

  // --------------------------------------------------------------------------
  // Private: exchangeCode
  // --------------------------------------------------------------------------

  /**
   * Exchange the authorization code for tokens at Google's token endpoint.
   */
  private async exchangeCode(
    code: string,
    codeVerifier: string,
    config: AuthConfig,
  ): Promise<GoogleTokenResponse> {
    const body = new URLSearchParams({
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.callbackUrl,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      auditLog('oauth_token_exchange_failed', {
        success: false,
        detail: errorText,
      });
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        'Failed to exchange authorization code',
      );
    }

    return response.json() as Promise<GoogleTokenResponse>;
  }

  // --------------------------------------------------------------------------
  // Private: verifyIdToken
  // --------------------------------------------------------------------------

  /**
   * Verify the ID token using Google's tokeninfo endpoint.
   * Validates: issuer, audience, expiry.
   */
  private async verifyIdToken(
    idToken: string,
    config: AuthConfig,
  ): Promise<GoogleProfile> {
    const response = await fetch(
      `${GOOGLE_TOKENINFO_URL}?id_token=${idToken}`,
    );

    if (!response.ok) {
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TOKEN_INVALID,
        'Invalid Google ID token',
      );
    }

    const payload = await response.json() as Record<string, unknown>;

    // Verify audience matches our client ID
    if (payload.aud !== config.google.clientId) {
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TOKEN_INVALID,
        'ID token audience mismatch',
      );
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      email_verified: payload.email_verified === 'true' || payload.email_verified === true,
      name: payload.name as string | undefined,
      given_name: payload.given_name as string | undefined,
      family_name: payload.family_name as string | undefined,
      picture: payload.picture as string | undefined,
    };
  }

  // --------------------------------------------------------------------------
  // Private: resolveAccount
  // --------------------------------------------------------------------------

  /**
   * Account resolution: find by googleId → find by email → create new user.
   * See dev-docs/architecture/oauth-flow.md#account-resolution
   */
  private async resolveAccount(
    profile: GoogleProfile,
  ): Promise<{ user: UserDocument; isNewUser: boolean }> {
    // 1. Try to find by googleId (returning Google user)
    const existingByGoogleId = await this.userRepo.findByGoogleId(profile.sub);
    if (existingByGoogleId) {
      return { user: existingByGoogleId, isNewUser: false };
    }

    // 2. Try to find by email (existing email-registered user)
    const existingByEmail = await this.userRepo.findByEmail(profile.email);
    if (existingByEmail) {
      // Link Google account to existing user using dedicated method (no type cast)
      const updatedUser = await this.userRepo.linkGoogleAccount(
        existingByEmail._id.toString(),
        profile.sub,
        {
          fullName: existingByEmail.fullName ?? profile.name,
          firstName: existingByEmail.firstName ?? profile.given_name,
          lastName: existingByEmail.lastName ?? profile.family_name,
        },
      );

      auditLog('account_linked', {
        userId: existingByEmail._id.toString(),
        success: true,
        detail: 'google_linked_to_existing',
      });

      return { user: updatedUser ?? existingByEmail, isNewUser: false };
    }

    // 3. Create new user (no password — Google-only user)
    const newUser = await this.userRepo.create({
      email: profile.email,
      googleId: profile.sub,
      isEmailVerified: true,
      fullName: profile.name,
      firstName: profile.given_name,
      lastName: profile.family_name,
    });

    return { user: newUser, isNewUser: true };
  }

  // --------------------------------------------------------------------------
  // Private: recordHistory
  // --------------------------------------------------------------------------

  /**
   * Record a login history entry.
   */
  private async recordHistory(data: CreateLoginHistoryData): Promise<void> {
    if (this.loginHistoryService) {
      await this.loginHistoryService.record(data);
    }
  }
}
