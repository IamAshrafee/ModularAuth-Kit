# ModularAuth-Kit

## Project Introduction & Complete Context Guide

> **One-Liner:** A production-ready, drop-in authentication module for Node.js + Express.js + TypeScript + MongoDB — designed to be copied into any project, configured with switches, and used as the project's native authentication system.

---

## Table of Contents

- [Why This Project Exists](#why-this-project-exists)
- [The Problem We're Solving](#the-problem-were-solving)
- [What This Project Is (and What It Is NOT)](#what-this-project-is-and-what-it-is-not)
- [Core Design Philosophy](#core-design-philosophy)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Feature Set](#feature-set)
- [Configuration System (The "Switches")](#configuration-system-the-switches)
- [Security Design](#security-design)
- [API Design](#api-design)
- [Database Design](#database-design)
- [Documentation Strategy](#documentation-strategy)
- [How a Developer Uses This Kit](#how-a-developer-uses-this-kit)
- [Project Principles (Non-Negotiables)](#project-principles-non-negotiables)
- [Standards & Specifications Followed](#standards--specifications-followed)
- [Glossary](#glossary)

---

## Why This Project Exists

Authentication is one of the most common things a developer builds — and one of the most tedious to rebuild every single time.

Every time you start a new project, you find yourself:
- Writing registration and login from scratch again
- Wiring password hashing and session handling again
- Implementing forgot/reset password again
- Rebuilding Google login again
- Redoing "security basics" repeatedly — rate limiting, enumeration protection, secure cookies
- Re-creating device/session management and login history

**This cycle repeats for every project, every time.** It's exhausting, error-prone, and a waste of time.

ModularAuth-Kit exists to **end this cycle permanently**.

---

## The Problem We're Solving

| Problem | How ModularAuth-Kit Solves It |
|---|---|
| Rebuilding auth from scratch every project | Copy one folder, configure, and ship |
| Forgetting security best practices | Secure by default — OWASP-aligned, pre-hardened |
| Different projects need different auth features | Switch-based config — enable only what you need |
| Hard to customize third-party auth services | This is YOUR code — modify, extend, adapt freely |
| External auth services own your user data | Your database, your collections, your data |
| Time wasted on boilerplate | Goes from "days of auth work" to "minutes of config" |

---

## What This Project Is (and What It Is NOT)

### ✅ What It Is

A **portable authentication module** — a single, well-structured folder (`src/auth/`) that becomes your project's native auth system:

- **Uses your own database** — MongoDB by default, uses your project's database connection, creates collections in your database
- **Becomes your own code** — not a dependency you import; it's code you own, read, modify, and extend
- **Follows clean architecture** — services, repositories, adapters, middleware — all separated, all testable, all replaceable
- **Configurable with switches** — every feature can be toggled on/off without touching code
- **Production-ready security** — follows OWASP guidelines, battle-tested patterns, no shortcuts

### ❌ What It Is NOT

- **Not a hosted auth service** — there's no external server, no API calls to a third-party
- **Not Firebase, Auth0, Clerk, or Supabase Auth** — those are external platforms; this is local code
- **Not a black-box library** — you see every line, understand every decision, change anything you need
- **Not a minimal example or tutorial** — this is a production-grade system with real security
- **Not opinionated about your app** — it handles auth; everything else (your routes, your business logic, your frontend) is entirely yours

---

## Core Design Philosophy

### 1. Secure by Default
Security is not optional and not "added later." Every auth flow ships with strong security defaults baked in. A developer using this kit gets OWASP-aligned security **without having to think about it**.

### 2. Modular & Switch-Based
Every major feature can be enabled or disabled via a single configuration object. Disabled features don't mount routes, don't run code, and don't exist in the API surface. There's no dead code running — switches are enforced at the route-mounting, validation, and service layers.

### 3. Developer-Friendly
Clean folder structure. Predictable patterns. Consistent request/response formats. Every file has a clear purpose. Any developer (or AI agent) should be able to read the code and immediately understand what each file does and how data flows.

### 4. Drop-In & Reusable
The entire auth system lives in one folder: `src/auth/`. To use it in a new project:
1. Copy the `src/auth/` folder
2. Install the dependencies
3. Set up `.env` with your database URL and secrets
4. Mount the auth router in your Express app
5. Done — you have a fully working, secure auth system

### 5. Extensible & Customizable
The code is yours. Need a custom field? Add it. Need a different email provider? Write an adapter. Need PostgreSQL instead of MongoDB? Implement the repository interface. The architecture is designed for extension, not for locking you in.

### 6. Completely Documented
Every feature, every configuration option, every API endpoint, every security decision is documented in hand-written Markdown files inside the project. No auto-generated docs, no Swagger, no external tools — just clear, human-readable documentation that any developer (or AI) can follow.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Node.js (18+) | Industry standard, massive ecosystem |
| **Framework** | Express.js | Most widely used Node.js framework, minimal and flexible |
| **Language** | TypeScript (strict mode) | Type safety, better DX, catches bugs at compile time |
| **Database** | MongoDB (via Mongoose) | Default adapter — flexible schema, easy to start with |
| **Password Hashing** | argon2id (`argon2` package) | Winner of the Password Hashing Competition, OWASP recommended, stronger than bcrypt |
| **Validation** | Zod | TypeScript-native schema validation — validates requests AND infers types |
| **Sessions** | Custom cookie-based server-side sessions | More secure than JWTs for web apps — instant revocation, no token leakage |
| **OAuth** | Google OAuth 2.0 (Authorization Code with PKCE) | Industry standard, via direct HTTP (no passport.js dependency overhead) |
| **Email** | Nodemailer (adapter-based) | Most popular Node.js email library, works with any SMTP provider |
| **Security** | Helmet + express-rate-limit | Battle-tested security middleware for Express |
| **Logging** | Built-in structured audit logger | Lightweight, no external dependency, focused on auth events |

### Why These Choices?

- **argon2id over bcrypt**: argon2id is the modern standard, recommended by OWASP. bcrypt has a 72-byte password limit; argon2id doesn't. argon2id is resistant to GPU attacks and side-channel attacks.
- **Zod over Joi/Yup**: Zod is built for TypeScript — it infers types from schemas, so your validation and types are always in sync. No duplicate type definitions.
- **Cookie sessions over JWTs**: For server-rendered or traditional REST APIs, cookie-based sessions are more secure. Sessions can be revoked instantly (unlike JWTs), and the session data stays server-side (unlike JWTs where it's in the token). The cookie holds only a session ID — nothing sensitive.
- **Direct Google OAuth over Passport.js**: Passport.js adds unnecessary abstraction for a single OAuth provider. Direct HTTP calls to Google's OAuth endpoints are simpler, more transparent, and easier to debug.

---

## Architecture Overview

The project follows a **layered clean architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                   HTTP LAYER                     │
│  Routes → Controllers → Middleware               │
│  (Express request/response handling)             │
├─────────────────────────────────────────────────┤
│                  SERVICE LAYER                   │
│  auth.service │ session.service │ token.service  │
│  password.service │ oauth.service │ email.service│
│  (All business logic lives here)                 │
├─────────────────────────────────────────────────┤
│               REPOSITORY LAYER                   │
│  Interfaces (contracts) + Implementations        │
│  (Data access — DB queries, CRUD operations)     │
├─────────────────────────────────────────────────┤
│                 ADAPTER LAYER                    │
│  MongoDB adapter │ Email adapter                 │
│  (External service integrations)                 │
├─────────────────────────────────────────────────┤
│                    DATABASE                      │
│  MongoDB (Users, Sessions, Tokens, LoginHistory) │
└─────────────────────────────────────────────────┘
```

### Data Flow (Example: Login)

```
1. Client sends POST /auth/login { email, password }
2. Route → rate-limiter middleware → Zod validation middleware → Controller
3. Controller calls authService.login(email, password)
4. authService calls userRepository.findByEmail(email)
5. authService calls passwordService.compare(password, hash)
6. authService calls sessionService.create(userId, req)
7. authService calls loginHistoryService.record(event) (if enabled)
8. Controller sets session cookie and returns success response
```

### Folder Structure

```
ModularAuth-Kit/
├── src/
│   ├── auth/                          ← THE DROP-IN MODULE
│   │   ├── index.ts                   ← Main entry point & mount helper
│   │   ├── auth.config.ts             ← Feature switches & configuration
│   │   ├── auth.types.ts              ← Shared TypeScript types/interfaces
│   │   ├── auth.constants.ts          ← Status codes, messages, defaults
│   │   │
│   │   ├── models/                    ← Mongoose schemas (database structure)
│   │   │   ├── user.model.ts
│   │   │   ├── session.model.ts
│   │   │   ├── token.model.ts         ← Reset/verification tokens
│   │   │   └── login-history.model.ts
│   │   │
│   │   ├── repositories/              ← Data access layer
│   │   │   ├── interfaces/            ← Repository contracts (DB-agnostic)
│   │   │   │   ├── user.repository.interface.ts
│   │   │   │   ├── session.repository.interface.ts
│   │   │   │   ├── token.repository.interface.ts
│   │   │   │   └── login-history.repository.interface.ts
│   │   │   └── mongodb/               ← MongoDB implementations
│   │   │       ├── user.repository.ts
│   │   │       ├── session.repository.ts
│   │   │       ├── token.repository.ts
│   │   │       └── login-history.repository.ts
│   │   │
│   │   ├── services/                  ← Business logic (the brain)
│   │   │   ├── auth.service.ts        ← Register, login, account logic
│   │   │   ├── session.service.ts     ← Session CRUD, rotation, revocation
│   │   │   ├── token.service.ts       ← Reset/verification token logic
│   │   │   ├── password.service.ts    ← Hashing, comparison, policy checks
│   │   │   ├── oauth.service.ts       ← Google OAuth flow logic
│   │   │   ├── email.service.ts       ← Send emails via adapter
│   │   │   └── login-history.service.ts
│   │   │
│   │   ├── http/                      ← Express layer (web interface)
│   │   │   ├── routes/
│   │   │   │   └── auth.routes.ts     ← All route definitions
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts       ← Register, login, logout
│   │   │   │   ├── password.controller.ts   ← Forgot, reset password
│   │   │   │   ├── verification.controller.ts ← Email verification
│   │   │   │   ├── oauth.controller.ts      ← Google OAuth
│   │   │   │   ├── session.controller.ts    ← Active sessions, revoke
│   │   │   │   └── history.controller.ts    ← Login history
│   │   │   └── middleware/
│   │   │       ├── authenticate.ts    ← requireAuth / optionalAuth
│   │   │       ├── rate-limiter.ts    ← Per-endpoint rate limiting
│   │   │       ├── validate.ts        ← Zod validation middleware
│   │   │       └── security.ts        ← Helmet, CSRF setup
│   │   │
│   │   ├── adapters/                  ← Pluggable external services
│   │   │   ├── email/
│   │   │   │   ├── email.adapter.interface.ts
│   │   │   │   ├── nodemailer.adapter.ts    ← Default SMTP adapter
│   │   │   │   └── console.adapter.ts       ← Dev/testing (logs to console)
│   │   │   └── database/
│   │   │       └── mongodb.adapter.ts       ← MongoDB connection helper
│   │   │
│   │   ├── utils/                     ← Helpers & utilities
│   │   │   ├── api-response.ts        ← Standardized success/error builders
│   │   │   ├── crypto.ts              ← Secure random tokens, SHA-256 helpers
│   │   │   ├── device-parser.ts       ← Parse user-agent → device info
│   │   │   └── audit-logger.ts        ← Auth event audit logging
│   │   │
│   │   └── errors/                    ← Custom error classes
│   │       ├── auth-error.ts          ← Base auth error
│   │       ├── validation-error.ts
│   │       ├── not-found-error.ts
│   │       └── rate-limit-error.ts
│   │
│   ├── app.ts                         ← Example Express app (demo)
│   └── server.ts                      ← Example server entry point
│
├── docs/                              ← Complete hand-written documentation
│   ├── README.md                      ← Quick start guide
│   ├── CONFIGURATION.md               ← All switches & options explained
│   ├── API.md                         ← Full API reference (every endpoint)
│   ├── ARCHITECTURE.md                ← Code structure & patterns
│   ├── SECURITY.md                    ← Security decisions & rationale
│   └── CUSTOMIZATION.md              ← How to extend/adapt
│
├── .env.example                       ← Template environment variables
├── tsconfig.json
├── package.json
└── Project_introduction.md            ← This file
```

### Key Architectural Decisions

**Why Repository Pattern?**
The repository pattern decouples business logic from database implementation. The services talk to interfaces, not to MongoDB directly. This means:
- You can swap MongoDB for PostgreSQL by implementing the same interface
- Business logic never changes when you change the database
- Testing is easier — you can mock the repository

**Why Adapters?**
Adapters encapsulate external services (email, database connections). Need to switch from Nodemailer to SendGrid? Write a new adapter implementing the same interface. Nothing else changes.

**Why Custom Sessions (Not express-session)?**
We implement our own session system because:
- Full control over session storage, rotation, and cleanup
- The session model is tailored for device management features
- No dependency on a session store that might not match our requirements
- We can implement exact OWASP session management recommendations

---

## Feature Set

### Always-On Features (Core)

These are the baseline — always present, always secure:

| Feature | Description |
|---|---|
| **Register with Email + Password** | Create account with email and password. Password hashed with argon2id. |
| **Login with Email + Password** | Authenticate and receive a session cookie. |
| **Logout** | Destroy current session. Cookie is cleared. |
| **Logout All Devices** | Destroy all user sessions across all devices. |
| **Get Current User** | Retrieve the authenticated user's profile. |
| **Update Profile** | Update allowed profile fields (name, etc.). |
| **Change Password** | Change password (requires current password). |
| **Standardized API Responses** | Every endpoint returns a consistent JSON envelope. |
| **Input Validation** | Every endpoint validates input with Zod schemas. |
| **Rate Limiting** | Login, register, and sensitive endpoints are rate-limited. |
| **Security Headers** | Helmet applies security headers to all responses. |
| **Audit Logging** | All auth events are logged with structured data. |
| **Account Enumeration Protection** | Error messages never reveal whether an account exists. |

### Switchable Features (Optional)

These can be toggled on/off in the configuration:

| Feature | Config Switch | What It Does |
|---|---|---|
| **Username Field** | `registration.fields.username` | Adds username to registration and optionally to login |
| **Full Name Field** | `registration.fields.fullName` | Adds fullName to registration |
| **First/Last Name Fields** | `registration.fields.firstName/lastName` | Adds firstName/lastName to registration |
| **Login with Username** | `login.identifiers: ['username']` | Allow login with username instead of/alongside email |
| **Google OAuth Login** | `login.allowGoogleOAuth` | Enable "Login with Google" via OAuth 2.0 + PKCE |
| **Forgot Password** | `passwordRecovery.enabled` | Enables forgot/reset password flow via email token |
| **Email Verification** | `emailVerification.enabled` | Sends verification code on registration |
| **Require Verification to Login** | `emailVerification.requiredToLogin` | Blocks unverified users from logging in |
| **Login History** | `loginHistory.enabled` | Records every login event with IP, device, timestamp |
| **Session/Device Management** | `sessionManagement.enabled` | View active sessions, logout from specific devices |
| **Max Active Sessions** | `sessionManagement.maxActiveSessions` | Limit how many devices can be logged in simultaneously |
| **Account Lockout** | `security.accountLockout.enabled` | Temporarily lock account after N failed login attempts |
| **CSRF Protection** | `security.csrfProtection` | Enable CSRF token validation |

### How Switches Work

When a feature is **disabled**:
- Its routes are **not mounted** (404 if someone tries to call them)
- Its validation schemas **exclude** the related fields
- Its service methods **short-circuit** (no unnecessary processing)
- Its database models still exist but **no data is written** for that feature

When a feature is **enabled**:
- Routes are mounted and available
- Validation schemas include the feature's fields
- Service methods execute the full feature logic
- Database documents include the feature's data

---

## Configuration System (The "Switches")

All configuration lives in `src/auth/auth.config.ts`. Here's the full configuration with every option:

```typescript
interface AuthConfig {
  // ───────────────────────────────────────────────
  // REGISTRATION
  // ───────────────────────────────────────────────
  registration: {
    fields: {
      username:  { enabled: boolean; required: boolean };
      fullName:  { enabled: boolean; required: boolean };
      firstName: { enabled: boolean; required: boolean };
      lastName:  { enabled: boolean; required: boolean };
    };
    validation: {
      password: {
        minLength: number;       // default: 8
        maxLength: number;       // default: 128
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumber: boolean;
        requireSpecial: boolean;
      };
      username: {
        minLength: number;       // default: 3
        maxLength: number;       // default: 30
        pattern: RegExp;         // default: /^[a-zA-Z0-9_]+$/
      };
      email: {
        maxLength: number;       // default: 254
      };
    };
  };

  // ───────────────────────────────────────────────
  // LOGIN
  // ───────────────────────────────────────────────
  login: {
    identifiers: ('email' | 'username')[];  // which fields can be used to login
    allowGoogleOAuth: boolean;               // enable Google OAuth login
  };

  // ───────────────────────────────────────────────
  // PASSWORD RECOVERY (Forgot/Reset Password)
  // ───────────────────────────────────────────────
  passwordRecovery: {
    enabled: boolean;
    identifiedBy: 'email' | 'username' | 'both';
    tokenExpiryMinutes: number;    // default: 15
  };

  // ───────────────────────────────────────────────
  // EMAIL VERIFICATION
  // ───────────────────────────────────────────────
  emailVerification: {
    enabled: boolean;
    requiredToLogin: boolean;       // block login if email not verified
    codeLength: number;             // OTP length, default: 6
    codeExpiryMinutes: number;      // default: 10
  };

  // ───────────────────────────────────────────────
  // SESSION
  // ───────────────────────────────────────────────
  session: {
    cookieName: string;             // default: 'sid'
    secret: string;                 // from env var
    maxAge: number;                 // cookie max age in ms, default: 7 days
    idleTimeout: number;            // session idle timeout in ms, default: 30 min
    rotateOnLogin: boolean;         // issue new session ID on login
    secure: boolean;                // Secure cookie flag (true in production)
    sameSite: 'strict' | 'lax' | 'none';
  };

  // ───────────────────────────────────────────────
  // LOGIN HISTORY
  // ───────────────────────────────────────────────
  loginHistory: {
    enabled: boolean;
    retentionDays: number;          // auto-delete old entries, default: 90
  };

  // ───────────────────────────────────────────────
  // SESSION/DEVICE MANAGEMENT
  // ───────────────────────────────────────────────
  sessionManagement: {
    enabled: boolean;
    maxActiveSessions: number;      // 0 = unlimited, default: 5
  };

  // ───────────────────────────────────────────────
  // GOOGLE OAUTH
  // ───────────────────────────────────────────────
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };

  // ───────────────────────────────────────────────
  // SECURITY
  // ───────────────────────────────────────────────
  security: {
    rateLimiting: {
      login:          { windowMs: number; maxAttempts: number };
      register:       { windowMs: number; maxAttempts: number };
      forgotPassword: { windowMs: number; maxAttempts: number };
    };
    accountLockout: {
      enabled: boolean;
      maxFailedAttempts: number;   // default: 5
      lockDurationMinutes: number; // default: 15
    };
    csrfProtection: boolean;
    helmet: boolean;
  };

  // ───────────────────────────────────────────────
  // EMAIL PROVIDER
  // ───────────────────────────────────────────────
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

### Configuration Loading Priority

1. **Defaults** — sensible, secure defaults are defined in the code
2. **auth.config.ts** — developer overrides in the config file
3. **Environment variables** — secrets and environment-specific values from `.env`

---

## Security Design

Security is the most critical layer of this project. Every decision is rooted in OWASP guidelines and industry best practices.

### Password Security

| Measure | Implementation |
|---|---|
| **Hashing Algorithm** | argon2id — OWASP's #1 recommendation for password hashing |
| **Hash Parameters** | OWASP-recommended: memory 19 MiB, iterations 2, parallelism 1 |
| **Password Policy** | Configurable min/max length, character requirements |
| **No Plain Text** | Passwords are hashed immediately; raw password is never stored or logged |
| **Timing-Safe Comparison** | Password verification uses constant-time comparison to prevent timing attacks |

### Session Security

| Measure | Implementation |
|---|---|
| **Server-Side Sessions** | Session data stored in database, not in the cookie |
| **Cookie Contains Only Session ID** | No sensitive data in the cookie |
| **HttpOnly Flag** | Cookie inaccessible to JavaScript, prevents XSS theft |
| **Secure Flag** | Cookie only sent over HTTPS (configurable for local dev) |
| **SameSite Flag** | Prevents CSRF by restricting cross-origin cookie sending |
| **Session Rotation** | New session ID generated on login to prevent session fixation |
| **Idle Timeout** | Sessions expire after inactivity period |
| **Absolute Timeout** | Sessions have a maximum lifetime regardless of activity |
| **Instant Revocation** | Any session can be revoked immediately (unlike JWTs) |

### Token Security (Reset & Verification)

| Measure | Implementation |
|---|---|
| **Cryptographically Random** | Tokens generated with `crypto.randomBytes()` |
| **Stored as SHA-256 Hash** | Raw token sent to user, hashed token stored in DB |
| **Short-Lived** | Tokens expire in 10–15 minutes (configurable) |
| **Single-Use** | Tokens are invalidated after first use |
| **One Token Per Type** | New token request invalidates previous unused tokens |

### API Security

| Measure | Implementation |
|---|---|
| **Rate Limiting** | Per-endpoint limits to prevent brute force (configurable) |
| **Account Lockout** | Temporary lock after N failed attempts (configurable) |
| **Account Enumeration Protection** | Login, registration, and forgot-password endpoints return identical error messages whether user exists or not |
| **Input Validation** | Every request body validated with Zod before processing |
| **Security Headers** | Helmet applies X-Frame-Options, HSTS, CSP, X-Content-Type-Options, etc. |
| **CSRF Protection** | Double-submit cookie pattern (configurable) |
| **No Stack Traces in Production** | Error details are sanitized in production responses |
| **Audit Trail** | Every auth event logged with timestamp, IP, user-agent, outcome |

### What We Deliberately Don't Do

- **Never return "User not found"** on login — always "Invalid credentials"
- **Never return "Email already registered"** on forgot-password — always "If an account exists, we've sent a reset email"
- **Never log passwords** — not even in debug mode
- **Never store raw tokens** — always hash before storing
- **Never expose session IDs in URLs** — only in HttpOnly cookies
- **Never send sensitive data in GET parameters** — always POST body

---

## API Design

### Response Format

Every endpoint returns a consistent JSON structure. This makes it predictable and easy for any frontend/client to consume.

**Success Response:**
```json
{
  "success": true,
  "message": "A human-readable success message",
  "data": {
    // Response payload (varies per endpoint)
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_ERROR_CODE",
    "message": "A human-readable error description",
    "details": [
      // Validation errors or additional context (array, may be empty)
    ]
  }
}
```

### Error Codes

Standardized machine-readable error codes that clients can reliably check:

| Code | HTTP Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body fails Zod validation |
| `INVALID_CREDENTIALS` | 401 | Wrong email/username/password |
| `UNAUTHORIZED` | 401 | No valid session cookie |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Email/username already exists (on register) |
| `ACCOUNT_LOCKED` | 423 | Too many failed login attempts |
| `RATE_LIMITED` | 429 | Too many requests |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required to proceed |
| `TOKEN_EXPIRED` | 400 | Reset/verification token has expired |
| `TOKEN_INVALID` | 400 | Reset/verification token is invalid |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Endpoints Overview

All routes are prefixed with `/auth` (configurable).

**Core Auth (always enabled):**
- `POST /auth/register` — Create new account
- `POST /auth/login` — Login with credentials
- `POST /auth/logout` — Logout current session
- `POST /auth/logout-all` — Logout all sessions
- `GET /auth/me` — Get current user profile
- `PATCH /auth/me` — Update profile fields
- `POST /auth/change-password` — Change password

**Google OAuth (switch: `login.allowGoogleOAuth`):**
- `GET /auth/google` — Redirect to Google consent screen
- `GET /auth/google/callback` — OAuth callback handler

**Password Recovery (switch: `passwordRecovery.enabled`):**
- `POST /auth/forgot-password` — Request reset email
- `POST /auth/reset-password` — Reset password with token

**Email Verification (switch: `emailVerification.enabled`):**
- `POST /auth/verify-email` — Verify with OTP code
- `POST /auth/resend-verification` — Resend verification email

**Session Management (switch: `sessionManagement.enabled`):**
- `GET /auth/sessions` — List active sessions/devices
- `DELETE /auth/sessions/:sessionId` — Revoke a specific session

**Login History (switch: `loginHistory.enabled`):**
- `GET /auth/login-history` — Paginated login event history

Each endpoint is fully documented in `docs/API.md` with: request body, headers, success response, error responses, and examples.

---

## Database Design

Four MongoDB collections, each with optimized indexes:

### `users` Collection
Stores user accounts. Fields are dynamically present based on configuration switches.
- **Always present:** `_id`, `email`, `passwordHash`, `isEmailVerified`, `isActive`, `createdAt`, `updatedAt`
- **Optional:** `username`, `fullName`, `firstName`, `lastName`, `googleId`, `avatar`
- **Indexes:** `email` (unique), `username` (unique sparse), `googleId` (unique sparse)

### `sessions` Collection
Stores active user sessions.
- **Fields:** `sessionId`, `userId`, `ipAddress`, `userAgent`, `device` (parsed), `lastActiveAt`, `expiresAt`, `createdAt`
- **Indexes:** `sessionId` (unique), `userId`, `expiresAt` (TTL — MongoDB auto-deletes expired documents)

### `tokens` Collection
Stores password reset and email verification tokens (hashed).
- **Fields:** `userId`, `tokenHash`, `type`, `expiresAt`, `usedAt`, `createdAt`
- **Indexes:** `tokenHash` (unique), `userId` + `type` (compound), `expiresAt` (TTL)

### `login_history` Collection
Stores login event records (if enabled).
- **Fields:** `userId`, `event`, `ipAddress`, `userAgent`, `device` (parsed), `failureReason`, `timestamp`
- **Indexes:** `userId` + `timestamp` (compound), `timestamp` (TTL for retention cleanup)

### Database Flexibility — Repository Pattern

all database access goes through **repository interfaces**. The default implementation uses MongoDB/Mongoose. But the interfaces are database-agnostic:

```
services → (call) → repository interfaces → (implemented by) → MongoDB repositories
                                           → (or) → PostgreSQL repositories (future)
                                           → (or) → MySQL repositories (future)
```

To add a new database, you only need to create new files in `repositories/postgresql/` (for example) that implement the same interfaces. The service layer doesn't change. The controller layer doesn't change. The routes don't change.

---

## Documentation Strategy

All documentation is hand-written in Markdown files. No auto-generated docs, no Swagger, no OpenAPI. Every document is structured, thorough, and readable by both humans and AI agents.

### Documentation Files

| File | Purpose |
|---|---|
| `docs/README.md` | **Quick Start Guide** — from zero to running in 5 minutes |
| `docs/CONFIGURATION.md` | **Configuration Reference** — every switch, every option, defaults, types, examples |
| `docs/API.md` | **API Reference** — every endpoint with request/response examples, error codes, headers |
| `docs/ARCHITECTURE.md` | **Architecture Guide** — folder structure, layer responsibilities, data flow, design decisions |
| `docs/SECURITY.md` | **Security Reference** — every security measure, the rationale, OWASP references |
| `docs/CUSTOMIZATION.md` | **Customization Guide** — how to add fields, swap DB, add email providers, modify flows |
| `Project_introduction.md` | **This file** — complete project context, vision, and technical overview |

### Documentation Principles
- **No placeholders** — every doc is complete, not "TODO"
- **Examples for everything** — request/response examples for every endpoint, config examples for every switch
- **Why, not just how** — every decision includes the reasoning behind it
- **AI-readable** — structured so that any AI agent can immediately understand the project and make changes

---

## How a Developer Uses This Kit

### Scenario: Starting a New Project

```
1. Create your Express.js project as usual
2. Copy the `src/auth/` folder into your project
3. Install the auth dependencies (listed in docs/README.md)
4. Create your .env file from .env.example
5. Open auth.config.ts and toggle the features you need:
   - Want Google login? Set allowGoogleOAuth: true
   - Want username field? Set registration.fields.username.enabled: true
   - Want forgot password? Set passwordRecovery.enabled: true
   - Want login history? Set loginHistory.enabled: true
6. Mount the auth router in your Express app:
   import { createAuthRouter } from './auth';
   app.use(createAuthRouter());
7. Start your server — you now have a complete auth system.
```

### What the Developer Gets

After those 7 steps, the project automatically has:
- ✅ Registration endpoint with validation
- ✅ Login endpoint with session cookie
- ✅ Logout (single and all devices)
- ✅ User profile endpoints
- ✅ Password change
- ✅ Rate limiting on sensitive endpoints
- ✅ Security headers
- ✅ Audit logging
- ✅ Account enumeration protection
- ✅ Whatever optional features they enabled

### What the Developer Can Customize

- **Add custom user fields:** Modify the User model and registration schema
- **Change validation rules:** Update password/username requirements in config
- **Swap database:** Implement repository interfaces for PostgreSQL/MySQL
- **Swap email provider:** Write a new email adapter (SendGrid, AWS SES, etc.)
- **Add custom middleware:** Insert middleware into the auth routes
- **Modify any flow:** It's all your code — change the service logic as needed
- **Add new endpoints:** Add routes, controllers, and services following the same patterns
- **Change cookie settings:** Update session config (name, expiry, domain, etc.)

---

## Project Principles (Non-Negotiables)

These principles guide every decision in the project:

1. **Secure Defaults** — every feature ships with the most secure settings. Developers can relax security if needed, not the other way around.

2. **Modular Switches** — every optional feature is a boolean switch. No feature is forced. No dead code runs for disabled features.

3. **Clean Structure & Readability** — any developer should be able to open any file and understand its purpose within 30 seconds. No clever abstractions, no hidden magic.

4. **Consistent API Responses** — every endpoint follows the same response envelope. No surprises. Clients can build generic error handlers.

5. **Easy Customization & Extension** — the architecture is designed to be modified and extended. It's not a locked library — it's a starting point that grows with your project.

6. **Complete Documentation** — if a feature exists, it's documented. If a decision was made, the reasoning is documented. No tribal knowledge.

7. **Standards Compliance** — we follow OWASP, RFCs, and industry-accepted patterns. No custom security inventions.

---

## Standards & Specifications Followed

| Standard / Specification | Where It's Applied |
|---|---|
| **OWASP Authentication Cheat Sheet** | Password hashing algorithm, policy, enumeration protection |
| **OWASP Session Management Cheat Sheet** | Cookie flags, session rotation, idle/absolute timeouts |
| **OWASP Top 10 (2025) A07** | Broken authentication mitigations throughout |
| **RFC 6749** | OAuth 2.0 Authorization Framework (Google login) |
| **RFC 7636** | PKCE extension for OAuth 2.0 (secure code exchange) |
| **OpenID Connect Core 1.0** | Google identity token verification |
| **RFC 7807** | Problem Details for HTTP APIs (error response format) |

---

## Glossary

| Term | Meaning |
|---|---|
| **Drop-in module** | A self-contained folder that can be copied into any project and work immediately |
| **Switch** | A boolean configuration that enables/disables a feature |
| **Repository** | An interface for database operations (CRUD). Implementations can be swapped. |
| **Adapter** | An interface for external services (email, database). Implementations can be swapped. |
| **Service** | A class/module containing business logic. Services call repositories and adapters. |
| **Controller** | A thin layer that handles HTTP requests, calls services, and returns responses. |
| **Session ID** | A random, high-entropy string stored in a cookie that identifies a user's session |
| **Token** | A short-lived, single-use string sent to users for password reset or email verification |
| **argon2id** | A modern password hashing algorithm, recommended by OWASP as the strongest option |
| **PKCE** | Proof Key for Code Exchange — a security extension for OAuth 2.0 |
| **TTL Index** | Time-To-Live index in MongoDB — automatically deletes documents after they expire |
| **Account Enumeration** | An attack where someone discovers valid usernames/emails by observing different error messages |
| **Session Fixation** | An attack where an attacker sets a known session ID before the user logs in |
| **Session Rotation** | Generating a new session ID after login to prevent session fixation attacks |

---

## Summary

**ModularAuth-Kit** is a reusable, secure, highly customizable authentication starter kit for **Node.js + Express.js + TypeScript + MongoDB**.

It is designed to be:
- **Copied** into any project as a native auth system
- **Configured** with switches — enable only what you need
- **Secured** by default — OWASP-aligned, no shortcuts
- **Extended** freely — it's your code, your database, your rules
- **Documented** completely — every feature, every decision, every endpoint

The goal is simple: **never rebuild authentication from scratch again.**