// ============================================================================
// ModularAuth-Kit — Session Service
// Server-side session management: creation, validation, rotation, revocation.
// See dev-docs/architecture/session-system.md
// ============================================================================

import type {
  AuthConfig,
  RequestMeta,
  SessionDocument,
  UserDocument,
} from '../auth.types.js';
import type { ISessionRepository } from '../repositories/interfaces/session.repository.interface.js';
import type { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { AuthError } from '../errors/auth-error.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../auth.constants.js';
import { generateToken } from '../utils/crypto.js';

// ============================================================================
// Dependencies
// ============================================================================

interface SessionServiceDeps {
  sessionRepository: ISessionRepository;
  userRepository: IUserRepository;
}

// ============================================================================
// Validation Result
// ============================================================================

export interface ValidateResult {
  session: SessionDocument;
  user: UserDocument;
}

// ============================================================================
// Session Service Class
// ============================================================================

export class SessionService {
  private readonly sessionRepo: ISessionRepository;
  private readonly userRepo: IUserRepository;

  constructor(deps: SessionServiceDeps) {
    this.sessionRepo = deps.sessionRepository;
    this.userRepo = deps.userRepository;
  }

  // --------------------------------------------------------------------------
  // create
  // --------------------------------------------------------------------------

  /**
   * Create a new session for a user.
   * Generates a 256-bit session ID, inserts the session document, and returns the ID.
   */
  async create(
    userId: string,
    meta: RequestMeta,
    config: AuthConfig,
  ): Promise<string> {
    const sessionId = generateToken(32); // 64-char hex, 256-bit entropy
    const expiresAt = new Date(Date.now() + config.session.maxAge);

    await this.sessionRepo.create({
      sessionId,
      userId,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      device: meta.device,
      expiresAt,
    });

    return sessionId;
  }

  // --------------------------------------------------------------------------
  // validate
  // --------------------------------------------------------------------------

  /**
   * Validate a session ID. Called on every authenticated request.
   * Checks expiry, idle timeout, and user status.
   *
   * @returns The session and user if valid
   * @throws AuthError(401) if invalid
   */
  async validate(
    sessionId: string,
    config: AuthConfig,
  ): Promise<ValidateResult> {
    // 1. Find session
    const session = await this.sessionRepo.findBySessionId(sessionId);
    if (!session) {
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
      );
    }

    const now = new Date();

    // 2. Check absolute expiry
    if (session.expiresAt < now) {
      await this.sessionRepo.deleteBySessionId(sessionId);
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
      );
    }

    // 3. Check idle timeout
    const idleExpiry = new Date(
      session.lastActiveAt.getTime() + config.session.idleTimeout,
    );
    if (idleExpiry < now) {
      await this.sessionRepo.deleteBySessionId(sessionId);
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
      );
    }

    // 4. Fetch user
    const user = await this.userRepo.findById(session.userId.toString());
    if (!user) {
      await this.sessionRepo.deleteBySessionId(sessionId);
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED,
        MESSAGES.UNAUTHORIZED,
      );
    }

    // 5. Touch session (update lastActiveAt)
    await this.touch(sessionId);

    return { session, user };
  }

  // --------------------------------------------------------------------------
  // touch
  // --------------------------------------------------------------------------

  /**
   * Update the session's lastActiveAt timestamp.
   * Called after every successful session validation to reset idle timeout.
   */
  async touch(sessionId: string): Promise<void> {
    await this.sessionRepo.touch(sessionId);
  }

  // --------------------------------------------------------------------------
  // rotate
  // --------------------------------------------------------------------------

  /**
   * Rotate the session ID to prevent session fixation attacks.
   * Generates a new session ID, updates the session document, returns the new ID.
   * Called after login and privilege changes (OWASP recommendation).
   */
  async rotate(sessionId: string): Promise<string> {
    const newSessionId = generateToken(32);
    await this.sessionRepo.updateSessionId(sessionId, newSessionId);
    return newSessionId;
  }

  // --------------------------------------------------------------------------
  // revokeById
  // --------------------------------------------------------------------------

  /**
   * Revoke (delete) a single session by its session ID.
   * Used for logout and device management.
   */
  async revokeById(sessionId: string): Promise<void> {
    await this.sessionRepo.deleteBySessionId(sessionId);
  }

  // --------------------------------------------------------------------------
  // revokeAllByUserId
  // --------------------------------------------------------------------------

  /**
   * Revoke all sessions for a user (logout everywhere).
   * Used on password change, password reset, and manual logout-all.
   */
  async revokeAllByUserId(userId: string): Promise<void> {
    await this.sessionRepo.deleteByUserId(userId);
  }

  // --------------------------------------------------------------------------
  // getActiveSessions
  // --------------------------------------------------------------------------

  /**
   * List all active sessions for a user.
   * Used for session management (showing active devices).
   */
  async getActiveSessions(userId: string): Promise<SessionDocument[]> {
    return this.sessionRepo.findByUserId(userId);
  }

  // --------------------------------------------------------------------------
  // enforceMaxSessions
  // --------------------------------------------------------------------------

  /**
   * Enforce the maximum number of active sessions for a user.
   * Deletes the oldest session if the count exceeds the limit.
   */
  async enforceMaxSessions(
    userId: string,
    maxSessions: number,
  ): Promise<void> {
    const count = await this.sessionRepo.countByUserId(userId);
    if (count >= maxSessions) {
      await this.sessionRepo.deleteOldestByUserId(userId);
    }
  }
}
