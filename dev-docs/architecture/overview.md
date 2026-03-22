[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# System Architecture Overview

This document describes the high-level architecture of ModularAuth-Kit: how layers interact, how data flows through the system, and how each component fits together.

---

## Table of Contents

- [Architecture Pattern](#architecture-pattern)
- [Layer Diagram](#layer-diagram)
- [Layer Responsibilities](#layer-responsibilities)
  - [HTTP Layer](#http-layer)
  - [Service Layer](#service-layer)
  - [Repository Layer](#repository-layer)
  - [Adapter Layer](#adapter-layer)
- [Data Flow Examples](#data-flow-examples)
  - [Registration Flow](#registration-flow)
  - [Login Flow](#login-flow)
  - [Authenticated Request Flow](#authenticated-request-flow)
  - [Forgot Password Flow](#forgot-password-flow)
  - [Google OAuth Flow](#google-oauth-flow)
- [Dependency Direction](#dependency-direction)
- [Key Principles](#key-principles)

---

## Architecture Pattern

ModularAuth-Kit uses a **Layered Clean Architecture** inspired by the Ports & Adapters (Hexagonal) pattern. The core idea:

- **Business logic** (services) never depends on external tools (database, email, HTTP framework)
- **External tools** are accessed through **interfaces** (repository interfaces, adapter interfaces)
- **Implementations** (MongoDB, Nodemailer) are injected and can be swapped without changing business logic
- **The HTTP layer** is thin — it handles request/response translation only, delegating all logic to services

---

## Layer Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                         HTTP LAYER                                │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────────┐    │
│  │  Routes   │──▶│ Middleware    │──▶│     Controllers        │    │
│  │           │   │ • rate-limit  │   │ • parse request        │    │
│  │ Defines   │   │ • validate   │   │ • call service          │    │
│  │ endpoints │   │ • authenticate│   │ • format response      │    │
│  └──────────┘   └──────────────┘   └──────────┬───────────────┘    │
├──────────────────────────────────────────────────┼─────────────────┤
│                      SERVICE LAYER               │                 │
│  ┌──────────────┐  ┌────────────────┐  ┌────────▼───────────┐     │
│  │ auth.service  │  │ session.service │  │ password.service   │     │
│  │ • register    │  │ • create        │  │ • hash             │     │
│  │ • login       │  │ • validate      │  │ • compare          │     │
│  │ • getProfile  │  │ • rotate        │  │ • checkPolicy      │     │
│  └──────┬───────┘  └──────┬─────────┘  └────────────────────┘     │
│         │                 │                                        │
│  ┌──────▼───────┐  ┌──────▼─────────┐  ┌────────────────────┐     │
│  │ token.service │  │ oauth.service  │  │ email.service      │     │
│  │ • generate    │  │ • getAuthUrl   │  │ • sendReset        │     │
│  │ • verify      │  │ • handleCb     │  │ • sendVerification │     │
│  │ • invalidate  │  │ • linkAccount  │  │                    │     │
│  └──────┬───────┘  └──────┬─────────┘  └──────┬─────────────┘     │
│         │                 │                    │                    │
│  ┌──────▼───────────────────────────────────────────────────┐      │
│  │               login-history.service                      │      │
│  │ • record event  • query history  • cleanup old entries   │      │
│  └──────┬───────────────────────────────────────────────────┘      │
├─────────┼──────────────────────────────────────────────────────────┤
│         ▼          REPOSITORY LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Interfaces (Contracts)                   │    │
│  │  IUserRepository │ ISessionRepository │ ITokenRepository   │    │
│  │                  │                    │ ILoginHistoryRepo  │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                 MongoDB Implementations                    │    │
│  │  UserRepository │ SessionRepository │ TokenRepository      │    │
│  │                 │                   │ LoginHistoryRepo     │    │
│  └────────────────────────────┬───────────────────────────────┘    │
├───────────────────────────────┼────────────────────────────────────┤
│                  ADAPTER LAYER│                                    │
│  ┌──────────────────┐  ┌──────▼──────────┐                        │
│  │  Email Adapter    │  │ Database Adapter │                        │
│  │  • Nodemailer     │  │ • MongoDB        │                        │
│  │  • Console (dev)  │  │                  │                        │
│  └──────────────────┘  └─────────────────┘                        │
├───────────────────────────────────────────────────────────────────┤
│                         DATABASE                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐    │
│  │  users    │ │ sessions │ │  tokens  │ │  login_history     │    │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### HTTP Layer

**Location:** `src/auth/http/`

The web interface. Handles everything Express-related and nothing else.

| Component | Responsibility |
|---|---|
| **Routes** (`routes/auth.routes.ts`) | Define which HTTP method + URL maps to which controller. Conditionally mounts routes based on feature switches. |
| **Controllers** (`controllers/`) | Parse the request, call the appropriate service method, set cookies/headers, and return a standardized JSON response. Controllers are **thin** — no business logic lives here. |
| **Middleware** (`middleware/`) | Cross-cutting concerns: authentication check, rate limiting, input validation (Zod), security headers. |

**Rules:**
- Controllers never access the database directly
- Controllers never contain business logic (no if/else about auth rules)
- Controllers always use the standardized response helpers (`sendSuccess`, `sendError`)
- Each controller file handles one feature area

### Service Layer

**Location:** `src/auth/services/`

The brain. All business logic lives here.

| Service | Responsibility |
|---|---|
| `auth.service.ts` | Registration logic, login logic, profile management, password change |
| `session.service.ts` | Create sessions, validate sessions, rotate session IDs, revoke sessions |
| `token.service.ts` | Generate reset/verification tokens, verify tokens, invalidate used tokens |
| `password.service.ts` | Hash passwords, compare passwords, enforce password policies |
| `oauth.service.ts` | Build Google OAuth URL, exchange code for tokens, verify ID token, link/create accounts |
| `email.service.ts` | Send password reset emails, send verification emails (delegates to email adapter) |
| `login-history.service.ts` | Record login events, query history, clean up old entries |

**Rules:**
- Services never import Express types (`Request`, `Response`)
- Services never send HTTP responses
- Services call repositories for data access, never query the DB directly
- Services throw typed errors (from `errors/`) — the HTTP layer catches and formats them

### Repository Layer

**Location:** `src/auth/repositories/`

Data access. Translates between business objects and database operations.

**Structure:**
```
repositories/
├── interfaces/          ← Contracts (database-agnostic)
│   ├── user.repository.interface.ts
│   ├── session.repository.interface.ts
│   ├── token.repository.interface.ts
│   └── login-history.repository.interface.ts
└── mongodb/             ← MongoDB implementations
    ├── user.repository.ts
    ├── session.repository.ts
    ├── token.repository.ts
    └── login-history.repository.ts
```

**Rules:**
- Interfaces define the contract: method names, parameter types, return types
- MongoDB implementations use Mongoose models to fulfill the contract
- Services only import and depend on the **interface**, never the implementation directly
- To add a new database: create a new folder (e.g., `postgresql/`) with implementations of the same interfaces

### Adapter Layer

**Location:** `src/auth/adapters/`

Encapsulates external service integrations.

| Adapter | Responsibility |
|---|---|
| `email/email.adapter.interface.ts` | Contract for sending emails |
| `email/nodemailer.adapter.ts` | Sends emails via SMTP using Nodemailer |
| `email/console.adapter.ts` | Logs emails to console (development/testing) |
| `database/mongodb.adapter.ts` | MongoDB connection helper, index creation |

**Rules:**
- Each adapter has an interface and at least one implementation
- Services use the interface, not the implementation
- Swapping an adapter = writing a new implementation, no other code changes

---

## Data Flow Examples

### Registration Flow

```
Client ─── POST /auth/register { email, password, ...fields } ───▶

  1. Route matched: POST /auth/register
  2. Middleware chain:
     a. rate-limiter: check if IP exceeded register limit → 429 if yes
     b. validate: parse body with Zod registerSchema → 400 if invalid
     c. security: verify CSRF token (if enabled) → 403 if invalid
  3. Controller: authController.register(req, res)
     a. Extracts validated body
     b. Calls authService.register({ email, password, ...fields })
  4. authService.register():
     a. Calls userRepository.findByEmail(email) → if exists, throw CONFLICT
     b. If username enabled: calls userRepository.findByUsername(username) → if exists, throw CONFLICT
     c. Calls passwordService.hash(password) → returns argon2id hash
     d. Calls userRepository.create({ email, passwordHash, ...fields })
     e. Calls sessionService.create(userId, requestMeta)
     f. If emailVerification enabled: calls tokenService.generateVerification(userId)
     g. If emailVerification enabled: calls emailService.sendVerification(email, code)
     h. If loginHistory enabled: calls loginHistoryService.record('login_success', ...)
     i. Returns { user, sessionId }
  5. Controller:
     a. Sets session cookie (HttpOnly, Secure, SameSite)
     b. Returns 201 { success: true, data: { user } }

◀─── 201 Created + Set-Cookie: sid=<sessionId>
```

### Login Flow

```
Client ─── POST /auth/login { email, password } ───▶

  1. Route matched: POST /auth/login
  2. Middleware: rate-limiter → validate → security
  3. Controller: authController.login(req, res)
  4. authService.login():
     a. Determine identifier type (email or username) from config
     b. Find user by identifier → if not found, throw INVALID_CREDENTIALS
     c. If accountLockout enabled: check if account is locked → throw ACCOUNT_LOCKED
     d. Call passwordService.compare(password, user.passwordHash)
        → if mismatch, record failed attempt, throw INVALID_CREDENTIALS
     e. If emailVerification.requiredToLogin && !user.isEmailVerified → throw EMAIL_NOT_VERIFIED
     f. If sessionManagement.maxActiveSessions > 0: check count, evict oldest if needed
     g. Call sessionService.create(userId, requestMeta)
     h. If loginHistory enabled: record 'login_success'
     i. If accountLockout: reset failed attempt counter
     j. Return { user, sessionId }
  5. Controller: set cookie, return 200 { success: true, data: { user } }

◀─── 200 OK + Set-Cookie: sid=<sessionId>
```

### Authenticated Request Flow

```
Client ─── GET /auth/me + Cookie: sid=<sessionId> ───▶

  1. Route matched: GET /auth/me
  2. Middleware: authenticate (requireAuth)
     a. Read session ID from cookie
     b. If no cookie: throw UNAUTHORIZED (401)
     c. Call sessionService.validate(sessionId)
     d. If session not found or expired: clear cookie, throw UNAUTHORIZED
     e. If idle timeout exceeded: destroy session, throw UNAUTHORIZED
     f. Update session.lastActiveAt (touch)
     g. Attach user to req.user
  3. Controller: authController.getProfile(req, res)
     a. Read req.user
     b. Return 200 { success: true, data: { user } }

◀─── 200 OK { user data }
```

### Forgot Password Flow

```
Client ─── POST /auth/forgot-password { email } ───▶

  1. Middleware: rate-limiter (strict) → validate
  2. authService.forgotPassword(email):
     a. Find user by email → if not found, STILL return success (enumeration protection)
     b. Invalidate any existing reset tokens for this user
     c. Generate random token → hash with SHA-256 → store hash in DB
     d. Send raw token to user's email via emailService
  3. Controller: return 200 { success: true, message: "If an account exists..." }

◀─── 200 OK (same response whether user exists or not)

--- Later ---

Client ─── POST /auth/reset-password { token, newPassword } ───▶

  1. Middleware: rate-limiter → validate
  2. authService.resetPassword(token, newPassword):
     a. Hash the provided token with SHA-256
     b. Find token record by hash → if not found → throw TOKEN_INVALID
     c. Check if expired → throw TOKEN_EXPIRED
     d. Check if already used → throw TOKEN_INVALID
     e. Hash new password with argon2id
     f. Update user's passwordHash
     g. Mark token as used
     h. Revoke all user sessions (force re-login everywhere)
     i. If loginHistory enabled: record 'password_reset'
  3. Controller: return 200 { success: true }

◀─── 200 OK
```

### Google OAuth Flow

```
Client ─── GET /auth/google ───▶

  1. oauthService.getAuthorizationUrl():
     a. Generate random state + PKCE code_verifier
     b. Store state + code_verifier in temporary session/cookie
     c. Build Google authorization URL with scopes, state, code_challenge
  2. Controller: redirect to Google

◀─── 302 Redirect → Google consent screen

--- User consents on Google ---

Google ─── GET /auth/google/callback?code=xxx&state=yyy ───▶

  1. oauthService.handleCallback(code, state, storedState, codeVerifier):
     a. Verify state matches stored state (CSRF protection)
     b. Exchange authorization code for tokens (access_token + id_token)
     c. Verify id_token signature and extract Google profile
     d. Find user by googleId:
        - If found: log them in (create session)
        - If not found: find by email
          - If email exists: link Google account, create session
          - If email doesn't exist: create new user + session
     e. If loginHistory enabled: record 'login_success' (method: 'google')
     f. Return { user, sessionId }
  2. Controller: set cookie, redirect to app

◀─── 302 Redirect → app URL + Set-Cookie: sid=<sessionId>
```

---

## Dependency Direction

Dependencies flow **inward** — outer layers depend on inner layers, never the reverse.

```
HTTP Layer ──depends on──▶ Service Layer ──depends on──▶ Repository Interfaces
                                         ──depends on──▶ Adapter Interfaces

MongoDB Implementations ──implements──▶ Repository Interfaces
Nodemailer Adapter ──implements──▶ Email Adapter Interface
```

**What this means:**
- Services never import from `http/` (no Express types)
- Repository interfaces never import from `mongodb/` (no Mongoose types)
- The entire MongoDB implementation can be replaced without touching services
- The entire email system can be replaced without touching services

---

## Key Principles

1. **Single Responsibility** — each file does one thing. `auth.service.ts` handles auth logic, not session management.

2. **Dependency Inversion** — services depend on interfaces, not implementations. This is what makes the system portable.

3. **Separation of Concerns** — HTTP concerns (cookies, headers, status codes) stay in the HTTP layer. Business rules stay in services. Data access stays in repositories.

4. **Feature Isolation** — each switchable feature has its own model, service, controller, and routes. Disabling a feature doesn't affect other features.

5. **Fail-Safe Defaults** — if a switch is not set, the secure/off default is used. No feature accidentally runs.

---

> 📖 **Related Docs:**
> - [Folder Structure](folder-structure.md) — detailed breakdown of every file
> - [Config System](config-system.md) — how switches control the architecture
> - [Database Design](database-design.md) — collection schemas and indexes
