// ============================================================================
// ModularAuth-Kit — Constants & Enumerations
// All error codes, HTTP statuses, default messages, config defaults, and
// named enums. No magic values elsewhere in the codebase — import from here.
// ============================================================================

// ============================================================================
// Error Codes — Machine-readable codes for client logic
// Maps to the `error.code` field in API error responses
// See dev-docs/conventions/api-response-format.md#error-codes-reference
// ============================================================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ============================================================================
// HTTP Status Codes — Named constants for readability
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  LOCKED: 423,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// ============================================================================
// User-Facing Messages — Default messages for each auth operation
// ============================================================================

export const MESSAGES = {
  // Success messages
  REGISTER_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_FETCHED: 'Profile retrieved successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  FORGOT_PASSWORD_SENT: 'If an account exists with that identifier, a password reset link has been sent',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  VERIFICATION_RESENT: 'Verification code has been sent',
  SESSIONS_FETCHED: 'Active sessions retrieved successfully',
  SESSION_REVOKED: 'Session revoked successfully',
  HISTORY_FETCHED: 'Login history retrieved successfully',

  // Error messages — security-sensitive messages use identical wording to prevent enumeration
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You are not authorized to perform this action',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in',
  ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts. Please try again later',
  RATE_LIMITED: 'Too many requests. Please try again later',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USERNAME_ALREADY_EXISTS: 'Username already taken',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again later',
  VALIDATION_FAILED: 'Validation failed',
  TOKEN_EXPIRED: 'This link has expired. Please request a new one',
  TOKEN_INVALID: 'This link is invalid or has already been used',
  SESSION_NOT_FOUND: 'Session not found',
  SAME_PASSWORD: 'New password must be different from current password',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
} as const;

// ============================================================================
// Default Configuration Values
// See dev-docs/architecture/config-system.md#default-values for reasoning
// ============================================================================

export const DEFAULTS = {
  // Session
  SESSION_COOKIE_NAME: 'sid',
  SESSION_MAX_AGE: 604_800_000,       // 7 days in ms
  SESSION_IDLE_TIMEOUT: 1_800_000,    // 30 minutes in ms

  // Password
  PASSWORD_MIN_LENGTH: 8,             // OWASP minimum recommendation
  PASSWORD_MAX_LENGTH: 128,           // argon2id has no practical limit

  // Username
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,

  // Email
  EMAIL_MAX_LENGTH: 254,              // RFC 5321

  // Token
  PASSWORD_RESET_EXPIRY_MINUTES: 15,  // Short-lived for security

  // Email verification
  VERIFICATION_CODE_LENGTH: 6,        // Standard OTP length
  VERIFICATION_CODE_EXPIRY_MINUTES: 15,

  // Login history
  LOGIN_HISTORY_RETENTION_DAYS: 90,   // 3-month retention

  // Session management
  MAX_ACTIVE_SESSIONS: 5,             // Reasonable device limit

  // Account lockout
  MAX_FAILED_ATTEMPTS: 5,             // Lock after 5 failures
  LOCK_DURATION_MINUTES: 15,          // 15-minute lockout

  // Rate limiting
  RATE_LIMIT_LOGIN_WINDOW_MS: 900_000,            // 15 minutes
  RATE_LIMIT_LOGIN_MAX_ATTEMPTS: 10,
  RATE_LIMIT_REGISTER_WINDOW_MS: 3_600_000,       // 1 hour
  RATE_LIMIT_REGISTER_MAX_ATTEMPTS: 5,
  RATE_LIMIT_FORGOT_PASSWORD_WINDOW_MS: 900_000,  // 15 minutes
  RATE_LIMIT_FORGOT_PASSWORD_MAX_ATTEMPTS: 3,

  // Email
  EMAIL_ADAPTER: 'console' as const,
  EMAIL_FROM: 'noreply@example.com',
} as const;

// ============================================================================
// Token Types — Discriminator for the tokens collection
// ============================================================================

export const TOKEN_TYPES = {
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
} as const;

// ============================================================================
// Login Events — Event names recorded in login history
// ============================================================================

export const LOGIN_EVENTS = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
} as const;

// ============================================================================
// Username Pattern — Default regex for usernames (alphanumeric + underscore)
// ============================================================================

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
