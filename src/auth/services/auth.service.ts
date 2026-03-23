// ============================================================================
// ModularAuth-Kit — Auth Service
// Core business logic for registration, login, profile management, and
// password changes. Orchestrates other services and repositories.
// See dev-docs/architecture/overview.md
// ============================================================================

import type {
  AuthConfig,
  RegisterDto,
  RegisterResult,
  LoginResult,
  UpdateProfileDto,
  RequestMeta,
  UserDocument,
} from '../auth.types.js';
import type { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import type { ILoginHistoryRepository, CreateLoginHistoryData } from '../repositories/interfaces/login-history.repository.interface.js';
import type { SessionService } from './session.service.js';
import type { TokenService } from './token.service.js';
import type { EmailService } from './email.service.js';
import { AuthError } from '../errors/auth-error.js';
import { ValidationError } from '../errors/validation-error.js';
import { NotFoundError } from '../errors/not-found-error.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES, LOGIN_EVENTS } from '../auth.constants.js';
import * as passwordService from './password.service.js';
import { auditLog } from '../utils/audit-logger.js';

// ============================================================================
// Dependencies
// ============================================================================

interface AuthServiceDeps {
  userRepository: IUserRepository;
  sessionService: SessionService;
  loginHistoryRepository?: ILoginHistoryRepository;
  tokenService?: TokenService;
  emailService?: EmailService;
}

// ============================================================================
// Auth Service Class
// ============================================================================

export class AuthService {
  private readonly userRepo: IUserRepository;
  private readonly sessionService: SessionService;
  private readonly loginHistoryRepo?: ILoginHistoryRepository;
  private readonly tokenService?: TokenService;
  private readonly emailService?: EmailService;

  constructor(deps: AuthServiceDeps) {
    this.userRepo = deps.userRepository;
    this.sessionService = deps.sessionService;
    this.loginHistoryRepo = deps.loginHistoryRepository;
    this.tokenService = deps.tokenService;
    this.emailService = deps.emailService;
  }

  // --------------------------------------------------------------------------
  // register
  // --------------------------------------------------------------------------

  /**
   * Register a new user account.
   * Creates the user, starts a session, and returns both.
   */
  async register(
    data: RegisterDto,
    meta: RequestMeta,
    config: AuthConfig,
  ): Promise<RegisterResult> {
    // 1. Normalize email
    const email = data.email.toLowerCase().trim();

    // 2. Check email uniqueness
    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new AuthError(
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.CONFLICT,
        MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    }

    // 3. If username enabled and provided, check uniqueness
    if (
      config.registration.fields.username.enabled &&
      data.username
    ) {
      const existingUsername = await this.userRepo.findByUsername(data.username);
      if (existingUsername) {
        throw new AuthError(
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.CONFLICT,
          MESSAGES.USERNAME_ALREADY_EXISTS,
        );
      }
    }

    // 4. Validate password against policy
    const violations = passwordService.validatePolicy(
      data.password,
      config.registration.validation.password,
    );
    if (violations.length > 0) {
      throw new ValidationError(
        violations.map((msg) => ({ field: 'password', message: msg })),
      );
    }

    // 5. Hash password
    const hashedPassword = await passwordService.hash(data.password);

    // 6. Create user
    const user = await this.userRepo.create({
      email,
      passwordHash: hashedPassword,
      username: data.username?.toLowerCase().trim(),
      fullName: data.fullName?.trim(),
      firstName: data.firstName?.trim(),
      lastName: data.lastName?.trim(),
    });

    // 7. Create session (delegated to SessionService — single source of truth)
    const sessionId = await this.sessionService.create(
      user._id.toString(),
      meta,
      config,
    );

    // 8. Send verification email (if enabled)
    if (
      config.emailVerification.enabled &&
      this.tokenService &&
      this.emailService
    ) {
      const code = await this.tokenService.generateVerificationCode(
        user._id.toString(),
        config,
      );
      await this.emailService.sendVerification(email, code, config);
    }

    // 9. Record login history (if enabled)
    if (config.loginHistory.enabled && this.loginHistoryRepo) {
      await this.recordHistory({
        userId: user._id.toString(),
        event: LOGIN_EVENTS.LOGIN_SUCCESS,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        device: meta.device,
        success: true,
      });
    }

    auditLog('register', {
      userId: user._id.toString(),
      ip: meta.ip,
      success: true,
    });

    return { user, sessionId };
  }

  // --------------------------------------------------------------------------
  // login
  // --------------------------------------------------------------------------

  /**
   * Authenticate a user with identifier (email or username) and password.
   * Handles account lockout, email verification checks, and failed attempt tracking.
   */
  async login(
    identifier: string,
    password: string,
    meta: RequestMeta,
    config: AuthConfig,
  ): Promise<LoginResult> {
    // 1. Find user by email or username
    const user = await this.findUserByIdentifier(identifier, config);

    if (!user) {
      // Enumeration protection: same error whether user not found or wrong password
      await this.recordFailedLogin(null, identifier, meta, config);
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS,
        MESSAGES.INVALID_CREDENTIALS,
      );
    }

    // 2. Check account lockout
    if (config.security.accountLockout.enabled && user.lockUntil) {
      if (user.lockUntil > new Date()) {
        auditLog('account_locked', {
          userId: user._id.toString(),
          ip: meta.ip,
          success: false,
          detail: 'login_attempt_while_locked',
        });
        throw new AuthError(
          HTTP_STATUS.LOCKED,
          ERROR_CODES.ACCOUNT_LOCKED,
          MESSAGES.ACCOUNT_LOCKED,
        );
      }
      // Lock has expired — reset
      await this.userRepo.resetFailedAttempts(user._id.toString());
    }

    // 3. Compare password — need to re-fetch with passwordHash
    const userWithPassword = await this.userRepo.findByEmailWithPassword(user.email);
    if (!userWithPassword || !userWithPassword.passwordHash) {
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS,
        MESSAGES.INVALID_CREDENTIALS,
      );
    }

    const passwordMatch = await passwordService.compare(
      password,
      userWithPassword.passwordHash,
    );

    if (!passwordMatch) {
      // 4. Handle failed attempt — atomic increment-and-check to prevent race conditions
      if (config.security.accountLockout.enabled) {
        const updatedUser = await this.userRepo.incrementFailedAttemptsAndGet(user._id.toString());

        if (
          updatedUser &&
          updatedUser.failedLoginAttempts >= config.security.accountLockout.maxFailedAttempts
        ) {
          const lockUntil = new Date(
            Date.now() + config.security.accountLockout.lockDurationMinutes * 60 * 1000,
          );
          await this.userRepo.lockAccount(user._id.toString(), lockUntil);
        }
      }

      await this.recordFailedLogin(user._id.toString(), identifier, meta, config);

      // Enumeration protection: identical error message
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS,
        MESSAGES.INVALID_CREDENTIALS,
      );
    }

    // 5. Check email verification requirement
    if (config.emailVerification.requiredToLogin && !user.isEmailVerified) {
      throw new AuthError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.EMAIL_NOT_VERIFIED,
        MESSAGES.EMAIL_NOT_VERIFIED,
      );
    }

    // 6. Reset failed login attempts
    if (config.security.accountLockout.enabled && user.failedLoginAttempts > 0) {
      await this.userRepo.resetFailedAttempts(user._id.toString());
    }

    // 7. Enforce max sessions (if enabled)
    if (config.sessionManagement.enabled) {
      await this.sessionService.enforceMaxSessions(
        user._id.toString(),
        config.sessionManagement.maxActiveSessions,
      );
    }

    // 8. Create session (delegated to SessionService)
    const sessionId = await this.sessionService.create(
      user._id.toString(),
      meta,
      config,
    );

    // 9. Record login history
    if (config.loginHistory.enabled && this.loginHistoryRepo) {
      await this.recordHistory({
        userId: user._id.toString(),
        event: LOGIN_EVENTS.LOGIN_SUCCESS,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        device: meta.device,
        success: true,
      });
    }

    auditLog('login_success', {
      userId: user._id.toString(),
      ip: meta.ip,
      success: true,
    });

    return { user, sessionId };
  }

  // --------------------------------------------------------------------------
  // getProfile
  // --------------------------------------------------------------------------

  /**
   * Retrieve a user's profile by ID.
   * passwordHash is already excluded by the repository.
   */
  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  // --------------------------------------------------------------------------
  // updateProfile
  // --------------------------------------------------------------------------

  /**
   * Update a user's profile fields.
   * Only allows updating fields that are enabled in config.
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
    config: AuthConfig,
  ): Promise<UserDocument> {
    // Validate that only enabled fields are being updated
    if (data.username !== undefined) {
      if (!config.registration.fields.username.enabled) {
        throw new ValidationError([
          { field: 'username', message: 'Username field is not enabled' },
        ]);
      }

      // Check username uniqueness
      const existing = await this.userRepo.findByUsername(data.username);
      if (existing && existing._id.toString() !== userId) {
        throw new AuthError(
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.CONFLICT,
          MESSAGES.USERNAME_ALREADY_EXISTS,
        );
      }
    }

    const updated = await this.userRepo.updateById(userId, data);
    if (!updated) {
      throw new NotFoundError('User');
    }

    return updated;
  }

  // --------------------------------------------------------------------------
  // changePassword
  // --------------------------------------------------------------------------

  /**
   * Change a user's password. Requires the current password for verification.
   * Revokes all other sessions as a security measure.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    config: AuthConfig,
    meta: RequestMeta,
  ): Promise<void> {
    // 1. Find user WITH passwordHash — single query using findByIdWithPassword
    const user = await this.userRepo.findByIdWithPassword(userId);

    if (!user || !user.passwordHash) {
      throw new NotFoundError('User');
    }

    // 2. Compare current password
    const match = await passwordService.compare(currentPassword, user.passwordHash);
    if (!match) {
      throw new AuthError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS,
        MESSAGES.CURRENT_PASSWORD_INCORRECT,
      );
    }

    // 3. Validate new password against policy
    const violations = passwordService.validatePolicy(
      newPassword,
      config.registration.validation.password,
    );
    if (violations.length > 0) {
      throw new ValidationError(
        violations.map((msg) => ({ field: 'newPassword', message: msg })),
      );
    }

    // 4. Hash new password
    const hashedPassword = await passwordService.hash(newPassword);

    // 5. Update passwordHash using dedicated method (no type cast needed)
    await this.userRepo.updatePasswordHash(userId, hashedPassword);

    // 6. Revoke all sessions (security measure — forces re-login)
    await this.sessionService.revokeAllByUserId(userId);

    // 7. Record in login history
    if (config.loginHistory.enabled && this.loginHistoryRepo) {
      await this.recordHistory({
        userId,
        event: LOGIN_EVENTS.PASSWORD_CHANGE,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        device: meta.device,
        success: true,
      });
    }

    auditLog('password_change', { userId, success: true });
  }

  // --------------------------------------------------------------------------
  // Private Helpers
  // --------------------------------------------------------------------------

  /**
   * Find user by email or username based on config identifiers.
   */
  private async findUserByIdentifier(
    identifier: string,
    config: AuthConfig,
  ): Promise<UserDocument | null> {
    const normalized = identifier.toLowerCase().trim();

    // Try email first if it's in the identifiers list
    if (config.login.identifiers.includes('email')) {
      const user = await this.userRepo.findByEmail(normalized);
      if (user) return user;
    }

    // Try username if it's in the identifiers list
    if (config.login.identifiers.includes('username')) {
      const user = await this.userRepo.findByUsername(normalized);
      if (user) return user;
    }

    return null;
  }

  /**
   * Record a failed login attempt in history and audit log.
   */
  private async recordFailedLogin(
    userId: string | null,
    identifier: string,
    meta: RequestMeta,
    config: AuthConfig,
  ): Promise<void> {
    if (config.loginHistory.enabled && this.loginHistoryRepo && userId) {
      await this.recordHistory({
        userId,
        event: LOGIN_EVENTS.LOGIN_FAILURE,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        device: meta.device,
        success: false,
        detail: 'invalid_password',
      });
    }

    auditLog('login_failure', {
      userId: userId ?? undefined,
      ip: meta.ip,
      success: false,
      detail: `Failed login for: ${identifier}`,
    });
  }

  /**
   * Record a login history entry.
   */
  private async recordHistory(
    data: CreateLoginHistoryData,
  ): Promise<void> {
    if (this.loginHistoryRepo) {
      await this.loginHistoryRepo.create(data);
    }
  }
}
