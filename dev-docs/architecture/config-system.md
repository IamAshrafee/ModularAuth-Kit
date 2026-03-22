[← Back to Index](../README.md) · [Architecture Overview](overview.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Configuration System

How the feature switch system works internally — from config definition to route mounting, schema building, and service logic branching.

---

## Table of Contents

- [Overview](#overview)
- [Config File Location](#config-file-location)
- [Config Loading Priority](#config-loading-priority)
- [Full Config Interface](#full-config-interface)
- [How Switches Affect Each Layer](#how-switches-affect-each-layer)
  - [Route Layer](#route-layer)
  - [Validation Layer](#validation-layer)
  - [Service Layer](#service-layer)
  - [Model Layer](#model-layer)
- [Default Values](#default-values)
- [Runtime Access](#runtime-access)
- [Adding a New Switch](#adding-a-new-switch)

---

## Overview

The config system is the backbone of ModularAuth-Kit's modularity. It provides a single object (`authConfig`) that controls:

1. **Which routes are mounted** — disabled features don't expose endpoints (404)
2. **Which validation schemas are applied** — disabled fields aren't required or accepted
3. **Which service logic runs** — disabled features short-circuit without processing
4. **Which database fields are populated** — disabled fields aren't written to documents

**Core principle:** A disabled feature has zero footprint — no routes, no validation, no processing, no data.

---

## Config File Location

```
src/auth/auth.config.ts
```

This file:
1. Defines the `AuthConfig` TypeScript interface (the shape of the config)
2. Exports a `defaultConfig` object with secure defaults
3. Exports a `getAuthConfig()` function that merges defaults with overrides and env vars
4. Is the **only file** developers need to edit to configure the auth module

---

## Config Loading Priority

Configuration values are resolved in this order (later overrides earlier):

```
1. Hardcoded defaults (in defaultConfig)
   ↕ overridden by ↕
2. Developer overrides (passed to createAuthRouter())
   ↕ overridden by ↕
3. Environment variables (for secrets and env-specific values)
```

**Example:**
```typescript
// Default: session.maxAge = 7 days
// Developer override: session.maxAge = 1 day
// Env var: SESSION_SECRET (always from env, never hardcoded)
```

**Rule:** Secrets (SESSION_SECRET, GOOGLE_CLIENT_SECRET, SMTP_PASS) **always** come from environment variables. Never hardcoded, never in config file.

---

## Full Config Interface

```typescript
interface AuthConfig {
  registration: {
    fields: {
      username:  { enabled: boolean; required: boolean };
      fullName:  { enabled: boolean; required: boolean };
      firstName: { enabled: boolean; required: boolean };
      lastName:  { enabled: boolean; required: boolean };
    };
    validation: {
      password: {
        minLength: number;
        maxLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumber: boolean;
        requireSpecial: boolean;
      };
      username: {
        minLength: number;
        maxLength: number;
        pattern: RegExp;
      };
      email: {
        maxLength: number;
      };
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
      login: { windowMs: number; maxAttempts: number };
      register: { windowMs: number; maxAttempts: number };
      forgotPassword: { windowMs: number; maxAttempts: number };
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
```

---

## How Switches Affect Each Layer

### Route Layer

In `auth.routes.ts`, routes are **conditionally mounted** based on config:

```typescript
// Pseudocode for route mounting
const router = Router();

// Core routes — always mounted
router.post('/register', rateLimiter('register'), validate(registerSchema), authController.register);
router.post('/login', rateLimiter('login'), validate(loginSchema), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.post('/logout-all', requireAuth, authController.logoutAll);
router.get('/me', requireAuth, authController.getProfile);
router.patch('/me', requireAuth, validate(updateProfileSchema), authController.updateProfile);
router.post('/change-password', requireAuth, validate(changePasswordSchema), authController.changePassword);

// Conditional routes
if (config.login.allowGoogleOAuth) {
  router.get('/google', oauthController.redirect);
  router.get('/google/callback', oauthController.callback);
}

if (config.passwordRecovery.enabled) {
  router.post('/forgot-password', rateLimiter('forgotPassword'), validate(forgotPasswordSchema), passwordController.forgotPassword);
  router.post('/reset-password', rateLimiter('forgotPassword'), validate(resetPasswordSchema), passwordController.resetPassword);
}

if (config.emailVerification.enabled) {
  router.post('/verify-email', requireAuth, validate(verifyEmailSchema), verificationController.verify);
  router.post('/resend-verification', requireAuth, rateLimiter('forgotPassword'), verificationController.resend);
}

if (config.sessionManagement.enabled) {
  router.get('/sessions', requireAuth, sessionController.listSessions);
  router.delete('/sessions/:sessionId', requireAuth, sessionController.revokeSession);
}

if (config.loginHistory.enabled) {
  router.get('/login-history', requireAuth, historyController.getHistory);
}
```

**Result:** Disabled features return 404 because their routes simply don't exist.

### Validation Layer

Zod schemas are **dynamically built** based on config:

```typescript
// Pseudocode for dynamic schema building
function buildRegisterSchema(config: AuthConfig) {
  let schema = z.object({
    email: z.string().email().max(config.registration.validation.email.maxLength),
    password: buildPasswordSchema(config.registration.validation.password),
  });

  if (config.registration.fields.username.enabled) {
    const usernameSchema = z.string()
      .min(config.registration.validation.username.minLength)
      .max(config.registration.validation.username.maxLength)
      .regex(config.registration.validation.username.pattern);

    if (config.registration.fields.username.required) {
      schema = schema.extend({ username: usernameSchema });
    } else {
      schema = schema.extend({ username: usernameSchema.optional() });
    }
  }

  if (config.registration.fields.fullName.enabled) {
    const fullNameSchema = z.string().min(1).max(100);
    if (config.registration.fields.fullName.required) {
      schema = schema.extend({ fullName: fullNameSchema });
    } else {
      schema = schema.extend({ fullName: fullNameSchema.optional() });
    }
  }

  // ... same pattern for firstName, lastName
  return schema;
}
```

**Result:** Disabled fields are not accepted in the request body. If someone sends `username` when username is disabled, it's silently stripped (Zod's `.strip()` mode).

### Service Layer

Services check config before executing optional logic:

```typescript
// In auth.service.ts
async register(data: RegisterDto, requestMeta: RequestMeta) {
  // Always: check email uniqueness
  const existingEmail = await this.userRepository.findByEmail(data.email);
  if (existingEmail) throw new AuthError(409, 'CONFLICT', 'Email already registered');

  // Conditional: check username uniqueness
  if (config.registration.fields.username.enabled && data.username) {
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) throw new AuthError(409, 'CONFLICT', 'Username already taken');
  }

  // Always: hash password + create user + create session
  // ...

  // Conditional: email verification
  if (config.emailVerification.enabled) {
    const code = await this.tokenService.generateVerificationCode(user._id);
    await this.emailService.sendVerificationEmail(user.email, code);
  }

  // Conditional: login history
  if (config.loginHistory.enabled) {
    await this.loginHistoryService.record('login_success', user._id, requestMeta);
  }
}
```

### Model Layer

Mongoose schemas include all possible fields, but only enabled fields receive data:

```typescript
// The User schema always has all fields defined (for flexibility)
// But disabled fields simply won't have data written to them
// The validation layer (Zod) ensures disabled fields don't arrive in the data
```

---

## Default Values

| Config Path | Default Value | Reasoning |
|---|---|---|
| `registration.fields.*.enabled` | `false` | Only email+password by default |
| `registration.validation.password.minLength` | `8` | OWASP minimum recommendation |
| `registration.validation.password.maxLength` | `128` | argon2id has no practical limit |
| `login.identifiers` | `['email']` | Email is the universal identifier |
| `login.allowGoogleOAuth` | `false` | Requires external setup |
| `passwordRecovery.enabled` | `false` | Requires email setup |
| `passwordRecovery.tokenExpiryMinutes` | `15` | Short-lived for security |
| `emailVerification.enabled` | `false` | Requires email setup |
| `emailVerification.codeLength` | `6` | Standard OTP length |
| `session.cookieName` | `"sid"` | Non-revealing name |
| `session.maxAge` | `604800000` (7 days) | Reasonable session lifetime |
| `session.idleTimeout` | `1800000` (30 min) | OWASP recommendation |
| `session.rotateOnLogin` | `true` | Prevents session fixation |
| `session.secure` | `true` | HTTPS-only cookies |
| `session.sameSite` | `"lax"` | CSRF protection with usability |
| `loginHistory.enabled` | `false` | Optional feature |
| `loginHistory.retentionDays` | `90` | 3-month retention |
| `sessionManagement.enabled` | `false` | Optional feature |
| `sessionManagement.maxActiveSessions` | `5` | Reasonable device limit |
| `security.accountLockout.enabled` | `false` | Optional, use rate limiting as base |
| `security.accountLockout.maxFailedAttempts` | `5` | Lock after 5 failures |
| `security.accountLockout.lockDurationMinutes` | `15` | 15-minute lockout |
| `security.csrfProtection` | `true` | Enabled by default |
| `security.helmet` | `true` | Security headers on by default |

---

## Runtime Access

The config object is created once at startup and passed through the module. Services and middleware receive it via constructor injection or module-level access:

```typescript
// In index.ts (entry point)
export function createAuthRouter(userConfig?: Partial<AuthConfig>): Router {
  const config = mergeConfig(defaultConfig, userConfig);
  // Pass config to services, middleware, routes
  // ...
}
```

**Config is immutable after startup.** It does not change during runtime. This prevents unexpected behavior from mid-flight config changes.

---

## Adding a New Switch

To add a new configurable feature:

1. **Add to interface:** Define the new switch in `AuthConfig` in `auth.types.ts`
2. **Set default:** Add a default value in `defaultConfig` in `auth.config.ts`
3. **Guard routes:** In `auth.routes.ts`, wrap the feature's routes with `if (config.newFeature.enabled)`
4. **Guard schemas:** In validation schemas, conditionally include/exclude fields
5. **Guard service logic:** In the relevant service, check `config.newFeature.enabled` before executing
6. **Document:** Add the switch to `docs/configuration/` and update the config overview

---

> 📖 **Related Docs:**
> - [Folder Structure](folder-structure.md) — where config files live
> - [Architecture Overview](overview.md) — how config affects data flow
> - [Coding Standards](../conventions/coding-standards.md) — config naming conventions
