[← Back to Index](../README.md) · [Architecture Overview](overview.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Folder Structure

Every folder and file in the auth module explained with its responsibility.

---

## Table of Contents

- [Top-Level Project Structure](#top-level-project-structure)
- [The Auth Module (src/auth/)](#the-auth-module-srcauth)
  - [Root Files](#root-files)
  - [models/](#models)
  - [repositories/](#repositories)
  - [services/](#services)
  - [http/](#http)
  - [adapters/](#adapters)
  - [utils/](#utils)
  - [errors/](#errors)
- [Demo Files](#demo-files)
- [File Naming Conventions](#file-naming-conventions)

---

## Top-Level Project Structure

```
ModularAuth-Kit/
├── src/                   Source code
│   ├── auth/              ← THE DROP-IN MODULE (portable)
│   ├── app.ts             Demo Express app (not part of the module)
│   └── server.ts          Demo server entry point (not part of the module)
│
├── dev-docs/              Internal development documentation (this folder)
├── docs/                  User-facing kit documentation
│
├── .env.example           Environment variable template
├── .gitignore             Git ignore rules
├── package.json           Project dependencies and scripts
├── tsconfig.json          TypeScript configuration
├── Project_introduction.md  Complete project context document
└── README.md              Project README (GitHub-facing)
```

---

## The Auth Module (`src/auth/`)

This is the portable folder. Everything inside this folder is designed to be copied into any Express.js project.

### Root Files

| File | Responsibility |
|---|---|
| `index.ts` | **Entry point.** Exports the `createAuthRouter()` function that mounts all auth routes. This is the only file a developer needs to import. Also exports the config type for TypeScript users. |
| `auth.config.ts` | **Configuration hub.** Defines the `AuthConfig` interface and the default config object. Reads from environment variables for secrets. All feature switches live here. See [Config System](config-system.md). |
| `auth.types.ts` | **Shared types.** TypeScript interfaces and types used across all layers: DTOs (Data Transfer Objects), document types, enums, request extensions. |
| `auth.constants.ts` | **Constants.** Error codes, default messages, HTTP status codes, cookie defaults, and other magic values — all in one place, never hardcoded elsewhere. |

### `models/`

Mongoose schema definitions. Each file exports a Mongoose model.

| File | Model | Collection | Purpose |
|---|---|---|---|
| `user.model.ts` | `User` | `users` | User accounts with dynamic fields based on config |
| `session.model.ts` | `Session` | `sessions` | Active sessions with device info |
| `token.model.ts` | `Token` | `tokens` | Password reset and email verification tokens (hashed) |
| `login-history.model.ts` | `LoginHistory` | `login_history` | Login event records |

**Key details:**
- Models define the schema shape, indexes, and TTL (Time-To-Live) settings
- The User model dynamically includes/excludes fields based on config switches
- Sessions and Tokens use TTL indexes for automatic cleanup by MongoDB
- See [Database Design](database-design.md) for full schema details

### `repositories/`

Data access layer. Split into interfaces (contracts) and implementations.

```
repositories/
├── interfaces/              ← Database-agnostic contracts
│   ├── user.repository.interface.ts
│   ├── session.repository.interface.ts
│   ├── token.repository.interface.ts
│   └── login-history.repository.interface.ts
└── mongodb/                 ← MongoDB/Mongoose implementations
    ├── user.repository.ts
    ├── session.repository.ts
    ├── token.repository.ts
    └── login-history.repository.ts
```

**Why this split?**
Services import the **interface**, not the MongoDB implementation. This means:
- To add PostgreSQL: create `repositories/postgresql/` with the same interface implementations
- Business logic never changes when switching databases
- See [ADR-005: Repository Pattern](../decisions/adr-005-repository-pattern.md)

### `services/`

All business logic. Services are the "brain" of the auth module.

| File | Responsibility |
|---|---|
| `auth.service.ts` | **Core auth logic.** Registration (validate uniqueness, create user, create session), login (find user, verify password, create session), get/update profile, change password. Orchestrates other services. |
| `session.service.ts` | **Session management.** Create session with device info, validate session by ID, rotate session ID, touch (update lastActive), revoke single session, revoke all user sessions, enforce max active sessions. |
| `token.service.ts` | **Token lifecycle.** Generate cryptographically secure tokens, hash for storage, verify against stored hash, enforce single-use, invalidate existing tokens of same type before creating new ones. |
| `password.service.ts` | **Password operations.** Hash with argon2id, compare password against hash, validate password against policy rules (length, complexity). No other service touches argon2 directly. |
| `oauth.service.ts` | **Google OAuth.** Build authorization URL with PKCE, exchange authorization code for tokens, verify Google ID token, find or create user from Google profile, link Google to existing account. |
| `email.service.ts` | **Email dispatch.** Composes password reset and verification emails (HTML + plain text), sends via the configured email adapter. Does not know which email provider is used. |
| `login-history.service.ts` | **Login events.** Records login events (success, failure, logout, password change) with metadata (IP, device, timestamp). Queries history with pagination. Cleans up old entries based on retention config. |

**Rules for services:**
- Never import Express types (`Request`, `Response`)
- Never send HTTP responses directly
- Throw typed errors from `errors/` — the controller catches them
- Call repositories for data access, never use Mongoose directly
- Services can call other services (e.g., `auth.service` calls `session.service`)

### `http/`

Express-specific layer. Everything HTTP lives here.

```
http/
├── routes/
│   └── auth.routes.ts              All route definitions
├── controllers/
│   ├── auth.controller.ts          Register, login, logout, profile
│   ├── password.controller.ts      Forgot password, reset password
│   ├── verification.controller.ts  Email verification
│   ├── oauth.controller.ts         Google OAuth redirect + callback
│   ├── session.controller.ts       Active sessions, revoke device
│   └── history.controller.ts       Login history
└── middleware/
    ├── authenticate.ts             requireAuth / optionalAuth
    ├── rate-limiter.ts             Per-endpoint rate limits
    ├── validate.ts                 Zod schema validation
    └── security.ts                 Helmet + CSRF setup
```

**Routes file (`auth.routes.ts`):**
- Single file that defines all routes
- Conditionally mounts routes based on feature switches
- Example: if `passwordRecovery.enabled === false`, the forgot/reset routes are simply not mounted

**Controllers:**
- Thin wrappers: extract data from request → call service → return response
- Each controller file handles one feature area
- All controllers use `sendSuccess()` and `sendError()` from utils for consistent responses

**Middleware:**
- `authenticate.ts`: Reads session cookie, validates session, attaches user to `req.user`. Exports `requireAuth` (401 if no session) and `optionalAuth` (continues without user).
- `rate-limiter.ts`: Configurable rate limiters per route group with different windows/limits.
- `validate.ts`: Generic middleware that takes a Zod schema and validates `req.body`. Returns 400 with structured validation errors on failure.
- `security.ts`: Applies Helmet headers and CSRF protection (if enabled).

### `adapters/`

Pluggable external service integrations.

```
adapters/
├── email/
│   ├── email.adapter.interface.ts    Contract: sendEmail(to, subject, html, text)
│   ├── nodemailer.adapter.ts         Production: sends via SMTP
│   └── console.adapter.ts            Development: logs email content to console
└── database/
    └── mongodb.adapter.ts            MongoDB connection + index setup
```

**Email adapters:**
- `console.adapter.ts` is the default in development — prints email content to terminal so you can test without SMTP
- `nodemailer.adapter.ts` is for production — connects to any SMTP provider
- To add SendGrid: create `sendgrid.adapter.ts` implementing `IEmailAdapter`

**Database adapter:**
- `mongodb.adapter.ts` handles connection string parsing, connection options, and ensures indexes are created on startup

### `utils/`

Helper functions used across layers.

| File | Purpose |
|---|---|
| `api-response.ts` | `sendSuccess(res, statusCode, message, data)` and `sendError(res, statusCode, code, message, details)` — ensures every response follows the standard envelope. See [API Response Format](../conventions/api-response-format.md). |
| `crypto.ts` | Cryptographic helpers: `generateToken(bytes)` returns a secure random hex string, `hashToken(token)` returns SHA-256 hash. Wraps Node.js `crypto` module. |
| `device-parser.ts` | Parses `User-Agent` header into structured device info: `{ browser, os, type }`. Uses `ua-parser-js` library. |
| `audit-logger.ts` | Structured logging for auth events. Logs to console in a parseable format with timestamp, event type, userId, IP, and outcome. Designed to be replaced with a production logger. |

### `errors/`

Custom error classes with HTTP status codes and error codes.

| File | Error Class | HTTP Status | When |
|---|---|---|---|
| `auth-error.ts` | `AuthError` | varies | Base class for all auth errors. Has `statusCode`, `code`, and `message`. |
| `validation-error.ts` | `ValidationError` | 400 | Zod validation failures with structured field-level details |
| `not-found-error.ts` | `NotFoundError` | 404 | Resource not found (used sparingly — we prefer generic errors for auth) |
| `rate-limit-error.ts` | `RateLimitError` | 429 | Rate limit exceeded |

**Error flow:**
1. Service detects an error condition → throws `new AuthError(401, 'INVALID_CREDENTIALS', '...')`
2. Controller has a try/catch → catches the error
3. Controller calls `sendError()` with the error's properties
4. Client receives standardized error JSON

See [Error Handling](error-handling.md) for the complete error hierarchy and flow.

---

## Demo Files

These files are **not part of the auth module**. They exist to demonstrate how to integrate the module.

| File | Purpose |
|---|---|
| `src/app.ts` | Creates an Express app, applies middleware, and mounts the auth router. Shows how few lines of code are needed. |
| `src/server.ts` | Entry point: loads `.env`, connects to MongoDB, starts the Express server. |

When a developer copies the kit, they only copy `src/auth/`. They write their own `app.ts` and `server.ts`.

---

## File Naming Conventions

| Pattern | Example | Meaning |
|---|---|---|
| `*.model.ts` | `user.model.ts` | Mongoose schema and model |
| `*.service.ts` | `auth.service.ts` | Business logic class/module |
| `*.controller.ts` | `auth.controller.ts` | HTTP request handler |
| `*.repository.ts` | `user.repository.ts` | Database implementation |
| `*.repository.interface.ts` | `user.repository.interface.ts` | Repository contract |
| `*.adapter.ts` | `nodemailer.adapter.ts` | External service implementation |
| `*.adapter.interface.ts` | `email.adapter.interface.ts` | Adapter contract |
| `*.types.ts` | `auth.types.ts` | TypeScript type definitions |
| `*.constants.ts` | `auth.constants.ts` | Constants and enums |

**Naming rules:**
- All filenames use **kebab-case** (e.g., `login-history.service.ts`)
- Each file has a single, clear responsibility reflected in its name
- Interface files always end with `.interface.ts`
- No `index.ts` barrel files except the module root

---

> 📖 **Related Docs:**
> - [Architecture Overview](overview.md) — high-level layer diagram and data flows
> - [Database Design](database-design.md) — schema details for each collection
> - [Coding Standards](../conventions/coding-standards.md) — TypeScript and naming conventions
