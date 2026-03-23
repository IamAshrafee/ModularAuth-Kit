// ============================================================================
// ModularAuth-Kit — Shared Type Definitions
// All TypeScript types, interfaces, and type aliases used across the auth module
// ============================================================================

import type { Document, Types } from 'mongoose';

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Field switch: controls whether a registration field is enabled and whether it's required.
 */
export interface FieldSwitch {
  enabled: boolean;
  required: boolean;
}

/**
 * Password validation rules applied during registration and password change.
 */
export interface PasswordValidation {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
}

/**
 * Username validation rules.
 */
export interface UsernameValidation {
  minLength: number;
  maxLength: number;
  pattern: RegExp;
}

/**
 * Email validation rules.
 */
export interface EmailValidation {
  maxLength: number;
}

/**
 * Rate limiting configuration for a single endpoint group.
 */
export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

/**
 * Complete configuration interface for the auth module.
 * All feature switches, validation rules, session settings, and security options.
 * See dev-docs/architecture/config-system.md for detailed documentation.
 */
export interface AuthConfig {
  registration: {
    fields: {
      username: FieldSwitch;
      fullName: FieldSwitch;
      firstName: FieldSwitch;
      lastName: FieldSwitch;
    };
    validation: {
      password: PasswordValidation;
      username: UsernameValidation;
      email: EmailValidation;
    };
  };

  login: {
    identifiers: ('email' | 'username')[];
    allowGoogleOAuth: boolean;
  };

  passwordRecovery: {
    enabled: boolean;
    identifiedBy: 'email' | 'username' | 'both';
    tokenExpiryMinutes: number;
  };

  emailVerification: {
    enabled: boolean;
    requiredToLogin: boolean;
    codeLength: number;
    codeExpiryMinutes: number;
  };

  session: {
    cookieName: string;
    secret: string;
    maxAge: number;
    idleTimeout: number;
    rotateOnLogin: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };

  loginHistory: {
    enabled: boolean;
    retentionDays: number;
  };

  sessionManagement: {
    enabled: boolean;
    maxActiveSessions: number;
  };

  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };

  security: {
    rateLimiting: {
      login: RateLimitConfig;
      register: RateLimitConfig;
      forgotPassword: RateLimitConfig;
      changePassword: RateLimitConfig;
    };
    accountLockout: {
      enabled: boolean;
      maxFailedAttempts: number;
      lockDurationMinutes: number;
    };
    csrfProtection: boolean;
    helmet: boolean;
  };

  email: {
    adapter: 'nodemailer' | 'console';
    from: string;
    smtp: {
      host: string;
      port: number;
      user: string;
      pass: string;
    };
  };
}

// ============================================================================
// Document Types (Mongoose)
// ============================================================================

/**
 * User document stored in the `users` collection.
 * Optional fields are populated based on config switches.
 */
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  googleId?: string;
  failedLoginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session document stored in the `sessions` collection.
 * Each session represents an active login from a specific device.
 */
export interface SessionDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  device: DeviceInfo;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Token document stored in the `tokens` collection.
 * Used for password reset and email verification tokens (hashed).
 */
export interface TokenDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TokenType;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

/**
 * Login history document stored in the `login_history` collection.
 * Records every login-related event for auditing purposes.
 */
export interface LoginHistoryDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  event: LoginEvent;
  ipAddress: string;
  userAgent: string;
  device: DeviceInfo;
  success: boolean;
  detail?: string;
  createdAt: Date;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * Data required to create a new user in the repository.
 */
export interface CreateUserDto {
  email: string;
  passwordHash?: string;  // Optional for Google OAuth-only users
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  googleId?: string;
  isEmailVerified?: boolean;
}

/**
 * Login request data.
 */
export interface LoginDto {
  identifier: string;
  password: string;
}

/**
 * Registration request data.
 * Dynamic fields are included based on config switches.
 */
export interface RegisterDto {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Profile update request data.
 * All fields optional — only provided fields are updated.
 */
export interface UpdateProfileDto {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

// ============================================================================
// Request Metadata & Device Info
// ============================================================================

/**
 * Parsed device information from the User-Agent header.
 */
export interface DeviceInfo {
  browser: string;
  os: string;
  type: 'desktop' | 'mobile' | 'tablet';
}

/**
 * Metadata extracted from the incoming HTTP request.
 * Used for session creation, login history, and audit logging.
 */
export interface RequestMeta {
  ip: string;
  userAgent: string;
  device: DeviceInfo;
}

// ============================================================================
// Enums
// ============================================================================

/**
 * Types of tokens issued by the auth module.
 */
export type TokenType = 'password_reset' | 'email_verification';

/**
 * Types of login-related events recorded in login history.
 */
export type LoginEvent =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset';

// ============================================================================
// Result Types
// ============================================================================

/**
 * Return type from a successful login operation.
 */
export interface LoginResult {
  user: UserDocument;
  sessionId: string;
}

/**
 * Return type from a successful registration operation.
 */
export interface RegisterResult {
  user: UserDocument;
  sessionId: string;
}
