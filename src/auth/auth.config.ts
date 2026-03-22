// ============================================================================
// ModularAuth-Kit — Configuration Module
// Defines default configuration, deep merge logic, and environment variable
// integration. Config is immutable after creation.
// See dev-docs/architecture/config-system.md for complete specification.
// ============================================================================

import type { AuthConfig } from './auth.types.js';
import {
  DEFAULTS,
  USERNAME_PATTERN,
} from './auth.constants.js';

// ============================================================================
// Default Configuration
// Secure defaults — all optional features disabled by default.
// See dev-docs/architecture/config-system.md#default-values for reasoning.
// ============================================================================

export const defaultConfig: AuthConfig = {
  registration: {
    fields: {
      username:  { enabled: false, required: false },
      fullName:  { enabled: false, required: false },
      firstName: { enabled: false, required: false },
      lastName:  { enabled: false, required: false },
    },
    validation: {
      password: {
        minLength: DEFAULTS.PASSWORD_MIN_LENGTH,
        maxLength: DEFAULTS.PASSWORD_MAX_LENGTH,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: false,
      },
      username: {
        minLength: DEFAULTS.USERNAME_MIN_LENGTH,
        maxLength: DEFAULTS.USERNAME_MAX_LENGTH,
        pattern: USERNAME_PATTERN,
      },
      email: {
        maxLength: DEFAULTS.EMAIL_MAX_LENGTH,
      },
    },
  },

  login: {
    identifiers: ['email'],
    allowGoogleOAuth: false,
  },

  passwordRecovery: {
    enabled: false,
    identifiedBy: 'email',
    tokenExpiryMinutes: DEFAULTS.PASSWORD_RESET_EXPIRY_MINUTES,
  },

  emailVerification: {
    enabled: false,
    requiredToLogin: false,
    codeLength: DEFAULTS.VERIFICATION_CODE_LENGTH,
    codeExpiryMinutes: DEFAULTS.VERIFICATION_CODE_EXPIRY_MINUTES,
  },

  session: {
    cookieName: DEFAULTS.SESSION_COOKIE_NAME,
    secret: '',  // Must be provided via SESSION_SECRET env var
    maxAge: DEFAULTS.SESSION_MAX_AGE,
    idleTimeout: DEFAULTS.SESSION_IDLE_TIMEOUT,
    rotateOnLogin: true,
    secure: true,
    sameSite: 'lax',
  },

  loginHistory: {
    enabled: false,
    retentionDays: DEFAULTS.LOGIN_HISTORY_RETENTION_DAYS,
  },

  sessionManagement: {
    enabled: false,
    maxActiveSessions: DEFAULTS.MAX_ACTIVE_SESSIONS,
  },

  google: {
    clientId: '',
    clientSecret: '',
    callbackUrl: '',
  },

  security: {
    rateLimiting: {
      login: {
        windowMs: DEFAULTS.RATE_LIMIT_LOGIN_WINDOW_MS,
        maxAttempts: DEFAULTS.RATE_LIMIT_LOGIN_MAX_ATTEMPTS,
      },
      register: {
        windowMs: DEFAULTS.RATE_LIMIT_REGISTER_WINDOW_MS,
        maxAttempts: DEFAULTS.RATE_LIMIT_REGISTER_MAX_ATTEMPTS,
      },
      forgotPassword: {
        windowMs: DEFAULTS.RATE_LIMIT_FORGOT_PASSWORD_WINDOW_MS,
        maxAttempts: DEFAULTS.RATE_LIMIT_FORGOT_PASSWORD_MAX_ATTEMPTS,
      },
    },
    accountLockout: {
      enabled: false,
      maxFailedAttempts: DEFAULTS.MAX_FAILED_ATTEMPTS,
      lockDurationMinutes: DEFAULTS.LOCK_DURATION_MINUTES,
    },
    csrfProtection: true,
    helmet: true,
  },

  email: {
    adapter: DEFAULTS.EMAIL_ADAPTER,
    from: DEFAULTS.EMAIL_FROM,
    smtp: {
      host: '',
      port: 587,
      user: '',
      pass: '',
    },
  },
};

// ============================================================================
// Deep Merge Utility
// Merges user overrides into default config, handling nested objects correctly.
// ============================================================================

/**
 * Checks whether a value is a plain object (not null, not an array, not a RegExp, not a Date).
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof RegExp) &&
    !(value instanceof Date)
  );
}

/**
 * Deep merge two objects. The `overrides` values take precedence.
 * - Plain objects are recursively merged
 * - Arrays, RegExps, Dates, and primitives are replaced entirely
 */
function deepMerge<T extends Record<string, unknown>>(
  defaults: T,
  overrides: Partial<T>,
): T {
  const result = { ...defaults };

  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const overrideValue = overrides[key];
    const defaultValue = defaults[key];

    if (isPlainObject(defaultValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(
        defaultValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>,
      ) as T[keyof T];
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue as T[keyof T];
    }
  }

  return result;
}

// ============================================================================
// Environment Variable Integration
// Secrets always come from environment variables — never hardcoded.
// ============================================================================

/**
 * Reads environment variables and overlays them onto the config.
 * Only secrets and environment-specific values come from env vars.
 */
function applyEnvironmentVariables(config: AuthConfig): AuthConfig {
  const env = process.env;

  // Session secret — always from env
  if (env.SESSION_SECRET) {
    config.session.secret = env.SESSION_SECRET;
  }

  // Google OAuth credentials — from env if using OAuth
  if (env.GOOGLE_CLIENT_ID) {
    config.google.clientId = env.GOOGLE_CLIENT_ID;
  }
  if (env.GOOGLE_CLIENT_SECRET) {
    config.google.clientSecret = env.GOOGLE_CLIENT_SECRET;
  }
  if (env.GOOGLE_CALLBACK_URL) {
    config.google.callbackUrl = env.GOOGLE_CALLBACK_URL;
  }

  // SMTP credentials — from env if using nodemailer adapter
  if (env.SMTP_HOST) {
    config.email.smtp.host = env.SMTP_HOST;
  }
  if (env.SMTP_PORT) {
    config.email.smtp.port = parseInt(env.SMTP_PORT, 10);
  }
  if (env.SMTP_USER) {
    config.email.smtp.user = env.SMTP_USER;
  }
  if (env.SMTP_PASS) {
    config.email.smtp.pass = env.SMTP_PASS;
  }
  if (env.EMAIL_FROM) {
    config.email.from = env.EMAIL_FROM;
  }

  return config;
}

// ============================================================================
// Config Validation
// Throws clear errors at startup if required values are missing.
// ============================================================================

/**
 * Validates the final config and throws descriptive errors for missing required values.
 */
function validateConfig(config: AuthConfig): void {
  // SESSION_SECRET is always required
  if (!config.session.secret) {
    throw new Error(
      '[ModularAuth-Kit] Missing required environment variable: SESSION_SECRET. ' +
      'Set a strong random string (min 32 characters) in your .env file.',
    );
  }

  // If Google OAuth is enabled, credentials are required
  if (config.login.allowGoogleOAuth) {
    if (!config.google.clientId) {
      throw new Error(
        '[ModularAuth-Kit] Google OAuth is enabled but GOOGLE_CLIENT_ID is missing. ' +
        'Set it in your .env file or disable OAuth (login.allowGoogleOAuth: false).',
      );
    }
    if (!config.google.clientSecret) {
      throw new Error(
        '[ModularAuth-Kit] Google OAuth is enabled but GOOGLE_CLIENT_SECRET is missing. ' +
        'Set it in your .env file or disable OAuth (login.allowGoogleOAuth: false).',
      );
    }
    if (!config.google.callbackUrl) {
      throw new Error(
        '[ModularAuth-Kit] Google OAuth is enabled but GOOGLE_CALLBACK_URL is missing. ' +
        'Set it in your .env file or disable OAuth (login.allowGoogleOAuth: false).',
      );
    }
  }

  // If email verification or password recovery is enabled with nodemailer, SMTP is required
  const needsEmail =
    (config.emailVerification.enabled || config.passwordRecovery.enabled) &&
    config.email.adapter === 'nodemailer';

  if (needsEmail) {
    if (!config.email.smtp.host) {
      throw new Error(
        '[ModularAuth-Kit] Email features are enabled with nodemailer but SMTP_HOST is missing. ' +
        'Set SMTP credentials in your .env file or use the console adapter (email.adapter: "console").',
      );
    }
  }
}

// ============================================================================
// Public API — createConfig()
// ============================================================================

/**
 * Creates the final, validated auth configuration.
 *
 * Priority (later overrides earlier):
 * 1. Hardcoded defaults (defaultConfig)
 * 2. Developer overrides (userConfig parameter)
 * 3. Environment variables (for secrets)
 *
 * @param userConfig — Partial config overrides from the developer
 * @returns Frozen AuthConfig object
 * @throws Error if required configuration values are missing
 */
export function createConfig(userConfig?: Partial<AuthConfig>): Readonly<AuthConfig> {
  // Step 1: Deep merge defaults with developer overrides
  const merged = userConfig
    ? deepMerge(defaultConfig as unknown as Record<string, unknown>, userConfig as unknown as Record<string, unknown>) as unknown as AuthConfig
    : { ...structuredClone(defaultConfig) };

  // Step 2: Overlay environment variables (secrets always from env)
  applyEnvironmentVariables(merged);

  // Step 3: Validate required values
  validateConfig(merged);

  // Step 4: Freeze to prevent runtime modifications
  return Object.freeze(merged);
}
