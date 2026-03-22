// ============================================================================
// ModularAuth-Kit — Token Service
// Generates, hashes, verifies, and invalidates tokens for password reset
// and email verification.
// See dev-docs/architecture/token-system.md
// ============================================================================

import type { AuthConfig, TokenDocument, TokenType } from '../auth.types.js';
import type { ITokenRepository } from '../repositories/interfaces/token.repository.interface.js';
import { AuthError } from '../errors/auth-error.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../auth.constants.js';
import { generateToken, generateOTP, hashToken } from '../utils/crypto.js';

// ============================================================================
// Dependencies
// ============================================================================

interface TokenServiceDeps {
  tokenRepository: ITokenRepository;
}

// ============================================================================
// Token Service Class
// ============================================================================

export class TokenService {
  private readonly tokenRepo: ITokenRepository;

  constructor(deps: TokenServiceDeps) {
    this.tokenRepo = deps.tokenRepository;
  }

  // --------------------------------------------------------------------------
  // generatePasswordResetToken
  // --------------------------------------------------------------------------

  /**
   * Generate a password reset token for a user.
   * Invalidates any existing reset tokens first.
   *
   * @returns The raw token (to be sent in the email)
   */
  async generatePasswordResetToken(
    userId: string,
    config: AuthConfig,
  ): Promise<string> {
    // Invalidate existing reset tokens for this user
    await this.tokenRepo.deleteByUserAndType(userId, 'password_reset');

    // Generate a 256-bit raw token
    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);

    // Calculate expiry
    const expiresAt = new Date(
      Date.now() + config.passwordRecovery.tokenExpiryMinutes * 60 * 1000,
    );

    // Store the hash (never the raw token)
    await this.tokenRepo.create({
      userId,
      tokenHash,
      type: 'password_reset',
      expiresAt,
    });

    return rawToken;
  }

  // --------------------------------------------------------------------------
  // generateVerificationCode
  // --------------------------------------------------------------------------

  /**
   * Generate an email verification OTP code for a user.
   * Invalidates any existing verification tokens first.
   *
   * @returns The raw OTP code (to be sent in the email)
   */
  async generateVerificationCode(
    userId: string,
    config: AuthConfig,
  ): Promise<string> {
    // Invalidate existing verification tokens for this user
    await this.tokenRepo.deleteByUserAndType(userId, 'email_verification');

    // Generate OTP code
    const code = generateOTP(config.emailVerification.codeLength);
    const tokenHash = hashToken(code);

    // Calculate expiry
    const expiresAt = new Date(
      Date.now() + config.emailVerification.codeExpiryMinutes * 60 * 1000,
    );

    // Store the hash
    await this.tokenRepo.create({
      userId,
      tokenHash,
      type: 'email_verification',
      expiresAt,
    });

    return code;
  }

  // --------------------------------------------------------------------------
  // verifyToken
  // --------------------------------------------------------------------------

  /**
   * Verify a raw token against the database.
   * Checks existence, type, expiry, and single-use.
   *
   * @returns The token document if valid
   * @throws AuthError if the token is invalid, expired, or already used
   */
  async verifyToken(
    rawToken: string,
    expectedType: TokenType,
  ): Promise<TokenDocument> {
    const tokenHash = hashToken(rawToken);

    const tokenDoc = await this.tokenRepo.findByHash(tokenHash);

    // Not found
    if (!tokenDoc) {
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TOKEN_INVALID,
        MESSAGES.TOKEN_INVALID,
      );
    }

    // Wrong type
    if (tokenDoc.type !== expectedType) {
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TOKEN_INVALID,
        MESSAGES.TOKEN_INVALID,
      );
    }

    // Expired
    if (tokenDoc.expiresAt < new Date()) {
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TOKEN_EXPIRED,
        MESSAGES.TOKEN_EXPIRED,
      );
    }

    // Already used
    if (tokenDoc.usedAt) {
      throw new AuthError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TOKEN_INVALID,
        MESSAGES.TOKEN_INVALID,
      );
    }

    return tokenDoc;
  }

  // --------------------------------------------------------------------------
  // markAsUsed
  // --------------------------------------------------------------------------

  /**
   * Mark a token as used (single-use enforcement).
   */
  async markAsUsed(tokenId: string): Promise<void> {
    await this.tokenRepo.markAsUsed(tokenId);
  }

  // --------------------------------------------------------------------------
  // invalidateByUserAndType
  // --------------------------------------------------------------------------

  /**
   * Invalidate (delete) all tokens of a specific type for a user.
   */
  async invalidateByUserAndType(
    userId: string,
    type: TokenType,
  ): Promise<void> {
    await this.tokenRepo.deleteByUserAndType(userId, type);
  }
}
