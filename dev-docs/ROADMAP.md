[← Back to Index](README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Development Roadmap

Complete step-by-step guide to build ModularAuth-Kit from start to finish. Designed to be followed sequentially — each step builds on the previous one. Every step includes what to implement, what to document (user docs + Postman testing docs), and how to verify.

> **For AI Agents:** Each step lists its exact input files (dependencies), output files (what to create/modify), and verification criteria. Follow in order. Do not skip steps.

---

## Table of Contents

- [How to Use This Roadmap](#how-to-use-this-roadmap)
- [Phase 1: Foundation & Config System](#phase-1-foundation--config-system)
- [Phase 2: Errors, Utils & Response Helpers](#phase-2-errors-utils--response-helpers)
- [Phase 3: Database Models & Repositories](#phase-3-database-models--repositories)
- [Phase 4: Password Service](#phase-4-password-service)
- [Phase 5: Auth Service — Register & Login](#phase-5-auth-service--register--login)
- [Phase 6: Session Service & Cookie Management](#phase-6-session-service--cookie-management)
- [Phase 7: HTTP Layer — Middleware](#phase-7-http-layer--middleware)
- [Phase 8: HTTP Layer — Auth Controllers & Routes](#phase-8-http-layer--auth-controllers--routes)
- [Phase 9: Demo App & First Verification](#phase-9-demo-app--first-verification)
- [Phase 10: Password Recovery (Forgot/Reset)](#phase-10-password-recovery-forgotreset)
- [Phase 11: Email Verification](#phase-11-email-verification)
- [Phase 12: Google OAuth](#phase-12-google-oauth)
- [Phase 13: Login History](#phase-13-login-history)
- [Phase 14: Session/Device Management](#phase-14-sessiondevice-management)
- [Phase 15: Account Lockout](#phase-15-account-lockout)
- [Phase 16: Audit Logging](#phase-16-audit-logging)
- [Phase 17: Module Entry Point & Mount Helper](#phase-17-module-entry-point--mount-helper)
- [Phase 18: User-Facing Documentation](#phase-18-user-facing-documentation)
- [Phase 19: Final Integration Testing](#phase-19-final-integration-testing)
- [Phase 20: Final Polish & README](#phase-20-final-polish--readme)

---

## How to Use This Roadmap

### For Developers
Follow the phases in order. Each phase has:
- **Goal** — what this phase achieves
- **Depends On** — which previous phases must be complete
- **Files to Create/Modify** — exact file paths
- **Implementation Details** — what logic to write
- **User Docs to Write** — which `docs/` files to create alongside
- **Testing Docs to Cross-Check** — which `testing/` Postman guides to verify and update against the real code
- **Verification** — how to confirm the phase works before moving on

> ⚠️ **Important: Testing Docs Were Pre-Written as Templates.**
> The `testing/` folder contains Postman test guides written _before_ development, based on the planned architecture. They contain expected request/response examples and verification checklists. **At each phase, you MUST cross-check the relevant testing doc against the real implementation** and update any response bodies, status codes, error messages, or field names that differ from the actual code. Do NOT skip this step — outdated testing docs are worse than no testing docs.

### For AI Agents
Each phase is self-contained with all context needed. When implementing a phase:
1. Read the **Depends On** files to understand your inputs
2. Read the linked **dev-docs/** architecture/convention docs for patterns to follow
3. Create the listed files following the patterns
4. Run the verification steps
5. Write the listed user-facing docs
6. **Cross-check and update** the listed Postman testing docs (in `testing/`) — ensure every request example, response body, status code, and error message matches the real running code
7. Move to the next phase

### Completion Tracking

Mark phases as you go:
- `[ ]` Not started
- `[/]` In progress
- `[x]` Complete + verified

### Skills Reference

The `.agents/skills/` directory contains 11 installed skills that provide patterns and best practices. **Before implementing a phase, read the relevant skill(s)** for that phase's domain:

| Skill | What It Provides | Use In Phases |
|---|---|---|
| **`typescript-expert`** | Strict mode, module resolution, advanced patterns, error classes | All phases (always consult) |
| **`typescript-advanced-types`** | Generics, conditional types, mapped types, utility types | 1 (config types), 2 (error types), 5 (service types) |
| **`nodejs-best-practices`** | Architecture layers, async patterns, validation, security mindset | 1, 2, 5, 7, 17 |
| **`express-rest-api`** | Routing, middleware, error handling, project structure | 7, 8, 9, 17 |
| **`mongodb`** | Schema design, indexes, TTL, aggregation, transactions | 3, 13, 14 |
| **`mongoose-mongodb`** | Mongoose ODM: schemas, hooks, virtuals, population | 3, 13, 14 |
| **`zod-schema-validation`** | Schema composition, safe parsing, transforms, error formatting | 1 (config), 5 (request schemas), 7 (validation middleware) |
| **`api-design`** | REST conventions, status codes, response format, pagination | 8, 9, 10, 11, 12, 13, 14 |
| **`security-best-practices`** | Helmet, rate limiting, CORS, CSRF, secret management | 6, 7, 15, 16, 19 |
| **`owasp-security`** | OWASP Top 10 patterns: injection, auth, crypto, SSRF, XSS | 4 (password hashing), 6 (sessions), 10 (tokens), 15 (lockout) |
| **`owasp-security-check`** | Security audit: 20 rules across 5 categories, severity levels | 19 (final security review), 16 (audit logging) |

> 💡 **How to use:** Before starting a phase, look at the "Use In Phases" column. Read the SKILL.md for each listed skill. Apply its patterns and checklists to your implementation.

---

## Phase 1: Foundation & Config System
`[x]` **Status: Complete** ✅

### Goal
Create the TypeScript type system, constants, and configuration module that everything else depends on.

### Depends On
- `package.json`, `tsconfig.json` (already created)
- [Architecture: Config System](architecture/config-system.md)
- [Architecture: Folder Structure](architecture/folder-structure.md)

### Files to Create

#### 1.1 — `src/auth/auth.types.ts`
All shared TypeScript types and interfaces for the entire auth module.

**Must include:**
- `AuthConfig` interface — the full configuration type (see [Config System](architecture/config-system.md#full-config-interface))
- `UserDocument` — user model type (all fields including optional ones)
- `SessionDocument` — session model type
- `TokenDocument` — token model type
- `LoginHistoryDocument` — login history model type
- `CreateUserDto` — data needed to create a user
- `LoginDto` — data for login
- `RegisterDto` — data for registration (dynamic fields)
- `UpdateProfileDto` — data for profile updates
- `RequestMeta` — IP address, user-agent, parsed device info (extracted from Express request)
- `DeviceInfo` — parsed device info type: `{ browser: string; os: string; type: 'desktop' | 'mobile' | 'tablet' }`
- `TokenType` enum — `'password_reset' | 'email_verification'`
- `LoginEvent` enum — `'login_success' | 'login_failure' | 'logout' | 'password_change' | 'password_reset'`
- `LoginResult` — return type of login: `{ user: UserDocument; sessionId: string }`
- `RegisterResult` — return type of register: `{ user: UserDocument; sessionId: string }`

**Design notes:**
- Use `interface` for object shapes, `type` for unions/aliases
- Export everything — other files import from here
- Follow naming conventions from [Coding Standards](conventions/coding-standards.md#types--interfaces)

#### 1.2 — `src/auth/auth.constants.ts`
All constants and enumerations.

**Must include:**
- `ERROR_CODES` object — all machine-readable error codes from [API Response Format](conventions/api-response-format.md#error-codes-reference)
- `HTTP_STATUS` object — named HTTP status code constants (200, 201, 400, 401, 403, 404, 409, 423, 429, 500)
- `MESSAGES` object — default user-facing messages for each operation (login success, register success, invalid credentials, etc.)
- `DEFAULTS` object — default configuration values (session maxAge, idle timeout, password min/max length, etc.)
- `TOKEN_TYPES` — `{ PASSWORD_RESET: 'password_reset', EMAIL_VERIFICATION: 'email_verification' }`
- `LOGIN_EVENTS` — `{ LOGIN_SUCCESS: 'login_success', LOGIN_FAILURE: 'login_failure', LOGOUT: 'logout', PASSWORD_CHANGE: 'password_change', PASSWORD_RESET: 'password_reset' }`

**Design notes:**
- Use `as const` for type narrowing
- Group by domain (errors, HTTP, messages, defaults, etc.)
- No magic values anywhere else in the codebase — import from here

#### 1.3 — `src/auth/auth.config.ts`
Configuration module with defaults and merge logic.

**Must include:**
- `defaultConfig: AuthConfig` — secure default values for every setting (see [Config System: Default Values](architecture/config-system.md#default-values))
- `mergeConfig(defaults, userOverrides)` function — deep merge user config with defaults
- Environment variable integration — secrets always from `process.env`:
  - `SESSION_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- Config validation — throw clear error at startup if required env vars are missing (e.g., SESSION_SECRET)

**Design notes:**
- Config is **immutable after creation** — no runtime modifications
- Use `Partial<AuthConfig>` for user overrides (everything optional)
- Deep merge must handle nested objects correctly
- Follow patterns from [Config System](architecture/config-system.md)

### Verification
```bash
# Type-check — everything compiles with no errors
npx tsc --noEmit
```
- All types exported correctly
- Config defaults match [Config System: Default Values](architecture/config-system.md#default-values)
- Config merge works with partial overrides

### User Docs to Write
None in this phase (internal foundational code).

---

## Phase 2: Errors, Utils & Response Helpers
`[x]` **Status: Complete** ✅

### Goal
Create the error class hierarchy, cryptographic utilities, response helpers, and device parser.

### Depends On
- Phase 1 (types, constants)
- [Architecture: Error Handling](architecture/error-handling.md)
- [Convention: API Response Format](conventions/api-response-format.md)

### Files to Create

#### 2.1 — `src/auth/errors/auth-error.ts`
Base error class. See [Error Handling: AuthError](architecture/error-handling.md#autherror-base-class).

**Must include:**
- `AuthError extends Error` with `statusCode`, `code`, and `details` properties
- Constructor: `(statusCode: number, code: string, message: string, details?: unknown[])`

#### 2.2 — `src/auth/errors/validation-error.ts`
**Must include:**
- `ValidationError extends AuthError` — always 400 + `VALIDATION_ERROR`
- Constructor accepts `Array<{ field: string; message: string }>`

#### 2.3 — `src/auth/errors/not-found-error.ts`
**Must include:**
- `NotFoundError extends AuthError` — always 404 + `NOT_FOUND`
- Constructor accepts optional resource name

#### 2.4 — `src/auth/errors/rate-limit-error.ts`
**Must include:**
- `RateLimitError extends AuthError` — always 429 + `RATE_LIMITED`
- Optional `retryAfterSeconds` property

#### 2.5 — `src/auth/utils/api-response.ts`
Standard response helpers. See [API Response Format](conventions/api-response-format.md#response-helpers).

**Must include:**
- `sendSuccess(res, statusCode, message, data?)` — sends success JSON envelope
- `sendError(res, statusCode, code, message, details?)` — sends error JSON envelope
- `handleError(res, error)` — checks if `error instanceof AuthError`, formats accordingly. Unknown errors → 500 + `INTERNAL_ERROR` (no stack trace in response, log to console).

#### 2.6 — `src/auth/utils/crypto.ts`
Cryptographic helpers. See [Token System: Token Generation](architecture/token-system.md#token-generation).

**Must include:**
- `generateToken(bytes?: number): string` — returns `crypto.randomBytes(bytes ?? 32).toString('hex')`
- `hashToken(token: string): string` — returns `SHA-256(token)` as hex
- `generateOTP(length?: number): string` — returns N-digit numeric code (default 6)
- `timingSafeCompare(a: string, b: string): boolean` — constant-time string comparison

#### 2.7 — `src/auth/utils/device-parser.ts`
User-Agent parsing. Uses `ua-parser-js`.

**Must include:**
- `parseDevice(userAgent: string): DeviceInfo` — returns `{ browser, os, type }`
- `type` should be inferred: mobile, tablet, or desktop (default)
- Handle missing/empty user-agent gracefully

#### 2.8 — `src/auth/utils/audit-logger.ts`
Structured logging for auth events.

**Must include:**
- `auditLog(event: string, data: { userId?: string; ip?: string; success: boolean; detail?: string })` — logs structured JSON to console
- Include ISO timestamp
- Format: `[AUTH] { timestamp, event, userId, ip, success, detail }`

### Verification
```bash
npx tsc --noEmit
```
- All error classes instantiate correctly with proper `instanceof` checks
- `sendSuccess()` and `sendError()` produce correct JSON structure
- `generateToken()` returns 64-char hex strings
- `hashToken()` produces deterministic SHA-256 hashes
- `generateOTP()` returns correct-length numeric strings
- `parseDevice()` correctly parses known user-agent strings

### User Docs to Write
None in this phase (internal utilities).

---

## Phase 3: Database Models & Repositories
`[x]` **Status: Complete** ✅

### Goal
Create Mongoose models and the repository layer (interfaces + MongoDB implementations).

### Depends On
- Phase 1 (types), Phase 2 (utils)
- [Architecture: Database Design](architecture/database-design.md) — all schemas, fields, indexes
- [ADR-005: Repository Pattern](decisions/adr-005-repository-pattern.md)

### Files to Create

#### 3.1 — Models
Create Mongoose schemas for all 4 collections as defined in [Database Design](architecture/database-design.md):

- `src/auth/models/user.model.ts` — User schema with all fields (including optional ones), indexes (email unique, username unique sparse, googleId unique sparse), timestamps enabled. **Exclude `passwordHash` from JSON/toObject transforms** (never leak hashes).
- `src/auth/models/session.model.ts` — Session schema with TTL index on `expiresAt`, compound index on `userId`.
- `src/auth/models/token.model.ts` — Token schema with TTL index on `expiresAt`, compound index on `userId + type`.
- `src/auth/models/login-history.model.ts` — LoginHistory schema with compound index on `userId + timestamp` (descending), TTL index on `timestamp`.

**Design notes:**
- Each model file exports the Mongoose model and the document type
- Use Mongoose `Schema.set('toJSON', { transform })` to strip `passwordHash` and `__v` from User
- TTL indexes: use `expireAfterSeconds: 0` with a Date field (MongoDB deletes when `expiresAt < now`)
- Follow field-by-field spec from [Database Design](architecture/database-design.md#users-collection)

#### 3.2 — Repository Interfaces
Define contracts for data access:

- `src/auth/repositories/interfaces/user.repository.interface.ts`
- `src/auth/repositories/interfaces/session.repository.interface.ts`
- `src/auth/repositories/interfaces/token.repository.interface.ts`
- `src/auth/repositories/interfaces/login-history.repository.interface.ts`

**Each interface must define:**
- All CRUD methods needed by the services
- Return types using document types from `auth.types.ts`
- See [Architecture: Folder Structure](architecture/folder-structure.md#repositories) for method examples

**User Repository interface methods:**
- `create(data)`, `findByEmail(email)`, `findByUsername(username)`, `findById(id)`, `findByGoogleId(googleId)`, `updateById(id, data)`, `setEmailVerified(id)`, `incrementFailedAttempts(id)`, `resetFailedAttempts(id)`, `lockAccount(id, until)`

**Session Repository interface methods:**
- `create(data)`, `findBySessionId(sessionId)`, `findByUserId(userId)`, `updateSessionId(oldId, newId)`, `touch(sessionId)`, `deleteBySessionId(sessionId)`, `deleteByUserId(userId)`, `countByUserId(userId)`, `deleteOldestByUserId(userId)`

**Token Repository interface methods:**
- `create(data)`, `findByHash(tokenHash)`, `markAsUsed(id)`, `deleteByUserAndType(userId, type)`, `deleteByUserId(userId)`

**Login History Repository interface methods:**
- `create(data)`, `findByUserId(userId, options: { page, limit })`, `deleteOldEntries(before: Date)`

#### 3.3 — MongoDB Implementations
Implement each interface using Mongoose models:

- `src/auth/repositories/mongodb/user.repository.ts`
- `src/auth/repositories/mongodb/session.repository.ts`
- `src/auth/repositories/mongodb/token.repository.ts`
- `src/auth/repositories/mongodb/login-history.repository.ts`

**Design notes:**
- Each implementation receives the Mongoose model via constructor or module import
- Methods use Mongoose queries (`.findOne()`, `.create()`, `.updateOne()`, `.deleteMany()`, etc.)
- `findByEmail` always applies `.select('-passwordHash')` (except internal login lookup which needs the hash)
- Handle Mongoose duplicate key errors (code 11000) and translate to readable errors

#### 3.4 — Database Adapter
- `src/auth/adapters/database/mongodb.adapter.ts`

**Must include:**
- `connectDatabase(uri: string): Promise<void>` — connect to MongoDB using Mongoose
- `disconnectDatabase(): Promise<void>` — clean disconnect
- Connection event logging (connected, disconnected, error)
- Retry logic on initial connection failure (optional)

### Verification
```bash
npx tsc --noEmit
```
- All models compile without errors
- All interfaces are correctly implemented by MongoDB repositories
- Adapter connects to a local MongoDB instance

### User Docs to Write
None in this phase (internal data layer).

---

## Phase 4: Password Service
`[x]` **Status: Complete** ✅

### Goal
Implement password hashing, comparison, and policy validation using argon2id.

### Depends On
- Phase 1 (types, config)
- [ADR-001: Password Hashing](decisions/adr-001-password-hashing.md)

### Files to Create

#### 4.1 — `src/auth/services/password.service.ts`

**Must include:**
- `hash(password: string): Promise<string>` — hash with argon2id using OWASP parameters (memory: 19MiB, iterations: 2, parallelism: 1)
- `compare(password: string, hash: string): Promise<boolean>` — verify password against hash. Uses argon2's built-in timing-safe comparison.
- `validatePolicy(password: string, config: AuthConfig): string[]` — check password against configured policy (minLength, maxLength, requireUppercase, requireLowercase, requireNumber, requireSpecial). Returns array of violation messages (empty = valid).

**Design notes:**
- This is the only file in the project that imports `argon2`
- No other service/controller ever touches password hashing directly
- `compare` should return `false` (not throw) on mismatch — let the caller decide on error handling
- See [ADR-001](decisions/adr-001-password-hashing.md) for parameter rationale

### Verification
```bash
npx tsc --noEmit
```
- Hash produces a string starting with `$argon2id$`
- Compare correctly validates matching passwords
- Compare correctly rejects wrong passwords
- Policy validation catches weak passwords

### User Docs to Write
None in this phase (internal service).

---

## Phase 5: Auth Service — Register & Login
`[x]` **Status: Complete** ✅

### Goal
Implement the core registration and login business logic.

### Depends On
- Phase 1-4 (types, errors, repositories, password service)
- [Architecture: Overview — Registration Flow](architecture/overview.md#registration-flow)
- [Architecture: Overview — Login Flow](architecture/overview.md#login-flow)
- [Architecture: Config System](architecture/config-system.md#service-layer)

### Files to Create

#### 5.1 — `src/auth/services/auth.service.ts`

**Must include:**

**`register(data: RegisterDto, meta: RequestMeta, config: AuthConfig): Promise<RegisterResult>`**
1. Normalize email (lowercase, trim)
2. Check email uniqueness → throw CONFLICT if exists
3. If username enabled AND provided: check username uniqueness → throw CONFLICT if exists
4. Validate password against policy → throw VALIDATION_ERROR if fails
5. Hash password with `passwordService.hash()`
6. Create user via `userRepository.create()`
7. Create session via `sessionService.create()` (Phase 6 dependency — use placeholder/interface for now)
8. Return `{ user, sessionId }`

**`login(identifier: string, password: string, meta: RequestMeta, config: AuthConfig): Promise<LoginResult>`**
1. Determine identifier type from `config.login.identifiers`
2. Find user by email or username → throw INVALID_CREDENTIALS if not found
3. If account lockout enabled: check if `lockUntil > now` → throw ACCOUNT_LOCKED
4. Compare password → if mismatch: if lockout enabled, increment failed attempts; throw INVALID_CREDENTIALS
5. If email verification required to login: check `isEmailVerified` → throw EMAIL_NOT_VERIFIED
6. Reset failed login attempts (if lockout enabled)
7. Create session via `sessionService.create()`
8. Return `{ user, sessionId }`

**`getProfile(userId: string): Promise<UserDocument>`**
1. Find user by ID → throw NOT_FOUND if not found
2. Return user (without passwordHash — already excluded by repository)

**`updateProfile(userId: string, data: UpdateProfileDto, config: AuthConfig): Promise<UserDocument>`**
1. Validate that only enabled fields are being updated
2. If updating username: check uniqueness → throw CONFLICT if exists
3. Update user via `userRepository.updateById()`
4. Return updated user

**`changePassword(userId: string, currentPassword: string, newPassword: string, config: AuthConfig): Promise<void>`**
1. Find user by ID (WITH passwordHash — internal lookup)
2. Compare current password → throw INVALID_CREDENTIALS if mismatch
3. Validate new password against policy → throw VALIDATION_ERROR if fails
4. Hash new password
5. Update user's passwordHash
6. Revoke all other sessions (except current) — security measure
7. Record in login history (if enabled)

**Design notes:**
- This service orchestrates other services (password, session, token, history)
- It must receive the config object (injected or passed) to check switches
- Error messages for login must be identical whether user not found or wrong password (enumeration protection)
- See [Architecture: Overview](architecture/overview.md) data flow diagrams

### Verification
```bash
npx tsc --noEmit
```
- AuthService instantiates with its dependencies
- Methods have correct signatures matching the types from Phase 1

### User Docs to Write
None in this phase (internal service — docs come with HTTP layer).

---

## Phase 6: Session Service & Cookie Management
`[x]` **Status: Complete** ✅

### Goal
Implement server-side session management: creation, validation, rotation, revocation.

### Depends On
- Phase 1-3 (types, utils/crypto, session repository)
- [Architecture: Session System](architecture/session-system.md)
- [ADR-002: Sessions Over JWT](decisions/adr-002-sessions-over-jwt.md)

### Files to Create

#### 6.1 — `src/auth/services/session.service.ts`

**Must include all methods from [Session System: Session Lifecycle](architecture/session-system.md#session-lifecycle):**

- `create(userId, meta: RequestMeta, config): Promise<string>` — generate session ID, parse device, insert session, return sessionId
- `validate(sessionId, config): Promise<{ session, user }>` — find session, check expiry, check idle timeout, fetch user, return both
- `touch(sessionId): Promise<void>` — update `lastActiveAt`
- `rotate(sessionId): Promise<string>` — generate new ID, update session, return new ID
- `revokeById(sessionId): Promise<void>` — delete single session
- `revokeAllByUserId(userId): Promise<void>` — delete all user sessions
- `getActiveSessions(userId): Promise<SessionDocument[]>` — list active sessions for user
- `enforceMaxSessions(userId, max, config): Promise<void>` — delete oldest session if count exceeds max

**Design notes:**
- Session ID generated with `generateToken(32)` from `utils/crypto.ts` — 256-bit entropy
- `validate()` is the most critical method — called on every authenticated request
- `validate()` must check both idle timeout AND absolute expiry
- Device parsing uses `parseDevice()` from `utils/device-parser.ts`
- Follow the complete lifecycle from [Session System](architecture/session-system.md)

### Verification
```bash
npx tsc --noEmit
```
- SessionService compiles with correct types
- Session creation produces 64-char hex session IDs

### User Docs to Write
None in this phase (internal service).

---

## Phase 7: HTTP Layer — Middleware
`[x]` **Status: Complete** ✅

### Goal
Create all Express middleware: authentication, rate limiting, Zod validation, and security headers.

### Depends On
- Phase 1-2 (types, constants, errors, response helpers), Phase 6 (session service)
- [Architecture: Folder Structure — Middleware](architecture/folder-structure.md#http)
- [Architecture: Error Handling — Middleware Layer](architecture/error-handling.md#middleware-layer)
- [OWASP Checklist](references/owasp-checklist.md)

### Files to Create

#### 7.1 — `src/auth/http/middleware/authenticate.ts`

**Must include:**
- `requireAuth(req, res, next)` — read session cookie → validate via `sessionService.validate()` → attach `req.user` → call `next()`. On failure: `sendError(401, 'UNAUTHORIZED')`.
- `optionalAuth(req, res, next)` — same as requireAuth but doesn't fail — sets `req.user = null` and continues.
- Extend Express `Request` type to include `user?: UserDocument` and `sessionId?: string`.

**Flow:** See [Session System: Session Validation Middleware Flow](architecture/session-system.md#session-validation-middleware-flow).

#### 7.2 — `src/auth/http/middleware/validate.ts`

**Must include:**
- `validate(schema: ZodSchema)` — returns Express middleware that parses `req.body` with the schema. On failure: returns 400 with `VALIDATION_ERROR` and field-level details. On success: replaces `req.body` with parsed (stripped/sanitized) data.

**Flow:** See [Error Handling: Validation Errors](architecture/error-handling.md#validation-errors-zod).

#### 7.3 — `src/auth/http/middleware/rate-limiter.ts`

**Must include:**
- `createRateLimiter(config, endpoint: 'login' | 'register' | 'forgotPassword')` — returns `express-rate-limit` middleware with the configured window/limit for that endpoint.
- Custom error handler that uses `sendError(429, 'RATE_LIMITED')`.
- Uses the config values from `config.security.rateLimiting[endpoint]`.

#### 7.4 — `src/auth/http/middleware/security.ts`

**Must include:**
- `setupSecurity(config: AuthConfig)` — returns array of middleware:
  - Helmet (if `config.security.helmet` is true)
  - CSRF protection (if `config.security.csrfProtection` is true) — double-submit cookie pattern
  - `cookie-parser` middleware

### Verification
```bash
npx tsc --noEmit
```
- All middleware functions have correct Express middleware signatures
- Validate middleware correctly transforms Zod errors into API response format

### User Docs to Write
None in this phase (internal middleware).

---

## Phase 8: HTTP Layer — Auth Controllers & Routes
`[x]` **Status: Complete** ✅

### Goal
Create controllers for core auth endpoints (register, login, logout, profile, change-password) and the route definitions.

### Depends On
- Phase 1-7 (everything above)
- [Architecture: Overview — Data Flows](architecture/overview.md#data-flow-examples)
- [Convention: API Response Format](conventions/api-response-format.md)
- [Architecture: Error Handling — Controller Layer](architecture/error-handling.md#controller-layer-catches)

### Files to Create

#### 8.1 — Zod Validation Schemas
Create a new file: `src/auth/http/schemas/auth.schemas.ts`

**Must include dynamic schema builders:**
- `buildRegisterSchema(config)` — email (required) + password (required) + conditional fields (username, fullName, firstName, lastName) based on config switches and required/optional settings
- `buildLoginSchema(config)` — identifier field (email or username or both) + password
- `buildUpdateProfileSchema(config)` — optional fields that are enabled
- `changePasswordSchema` — `{ currentPassword, newPassword }`

**Design notes:**
- Schemas built dynamically in `createAuthRouter()` based on config (built once at startup, not per request)
- Follow [Config System: Validation Layer](architecture/config-system.md#validation-layer)

#### 8.2 — `src/auth/http/controllers/auth.controller.ts`

**Must include (all methods follow [Controller pattern](conventions/coding-standards.md#controller-methods)):**
- `register(req, res)` — extract validated body → call `authService.register()` → set session cookie → `sendSuccess(201)`
- `login(req, res)` — extract validated body → call `authService.login()` → set session cookie → `sendSuccess(200)`
- `logout(req, res)` — call `sessionService.revokeById(req.sessionId)` → clear cookie → `sendSuccess(200)`
- `logoutAll(req, res)` — call `sessionService.revokeAllByUserId(req.user._id)` → clear cookie → `sendSuccess(200)`
- `getProfile(req, res)` — call `authService.getProfile(req.user._id)` → `sendSuccess(200)`
- `updateProfile(req, res)` — call `authService.updateProfile(req.user._id, body)` → `sendSuccess(200)`
- `changePassword(req, res)` — call `authService.changePassword()` → `sendSuccess(200)`

**Cookie helper functions (in controller or utils):**
- `setSessionCookie(res, sessionId, config)` — sets the HttpOnly/Secure/SameSite cookie
- `clearSessionCookie(res, config)` — clears the cookie

#### 8.3 — `src/auth/http/routes/auth.routes.ts`

**Must include:**
- Express `Router` with all core routes mounted
- Rate limiter applied to `login` and `register`
- Validation middleware applied to all endpoints with bodies
- `requireAuth` applied to all protected endpoints
- Conditional mounting for optional feature routes (empty for now — added in Phases 10-15)
- Follow the routing pattern from [Config System: Route Layer](architecture/config-system.md#route-layer)

### Verification
```bash
npx tsc --noEmit
```
- All controllers compile with correct types
- Route file mounts all core endpoints with correct middleware chains

### User Docs to Write

#### `docs/api/overview.md`
- Response format (success + error envelopes)
- Authentication method (cookie-based)
- Common error codes table

#### `docs/api/auth-endpoints.md`
- POST `/auth/register` — full request/response doc
- POST `/auth/login` — full request/response doc
- POST `/auth/logout` — full request/response doc
- POST `/auth/logout-all` — full request/response doc
- GET `/auth/me` — full request/response doc
- PATCH `/auth/me` — full request/response doc
- POST `/auth/change-password` — full request/response doc

**For each endpoint document:**
- Method & URL
- Authentication required? (yes/no)
- Request headers
- Request body (with field types, required/optional)
- Success response (status code + body example)
- Error responses (all possible error codes with examples)
- Example `curl` command

---

## Phase 9: Demo App & First Verification
`[x]` **Status: Complete** ✅

### Goal
Create a working demo app, connect everything, and manually verify the core auth flow.

### Depends On
- Phase 1-8 (everything above)

### Files to Create

#### 9.1 — `src/app.ts`
Demo Express application.

**Must include:**
- Import and configure Express
- Apply `cookie-parser`, `express.json()`, security middleware
- Mount auth router from `src/auth/index.ts` (or directly from routes for now)
- Global error handler
- A simple `GET /health` endpoint to confirm server is running

#### 9.2 — `src/server.ts`
Server entry point.

**Must include:**
- Load `.env` with `dotenv`
- Connect to MongoDB via `mongodb.adapter.ts`
- Start Express server on configured port
- Log startup info (port, environment)

### Verification — CRITICAL MILESTONE 🎯

This is the first time we run the project end-to-end. Verify ALL of the following:

```bash
# 1. Start the server
npm run dev

# 2. Health check
curl http://localhost:3000/health
# Expect: 200 OK

# 3. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
# Expect: 201 + Set-Cookie header + user data

# 4. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
# Expect: 200 + Set-Cookie header + user data

# 5. Get profile (with cookie)
curl http://localhost:3000/auth/me \
  -H "Cookie: sid=<session_id_from_login>"
# Expect: 200 + user data

# 6. Get profile (without cookie)
curl http://localhost:3000/auth/me
# Expect: 401 UNAUTHORIZED

# 7. Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Cookie: sid=<session_id>"
# Expect: 200 + cookie cleared

# 8. Validation error
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"short"}'
# Expect: 400 + VALIDATION_ERROR with field details

# 9. Rate limiting
# Send 6 rapid login requests — expect 429 on the 6th

# 10. Duplicate registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
# Expect: 409 CONFLICT
```

**All 10 checks must pass before proceeding.**

### User Docs to Write

#### `docs/getting-started/quick-start.md`
- Prerequisites (Node.js, MongoDB)
- Clone, install, configure `.env`, start
- First register/login test

#### `docs/getting-started/installation.md`
- Detailed dependency installation
- MongoDB setup
- Environment variable configuration

#### `docs/getting-started/environment-variables.md`
- Table of all env vars: name, type, required/optional, default, example

### Testing Docs to Cross-Check

> ⚠️ The `testing/` docs were pre-written as templates. You **MUST** cross-check every example against the real running code and update any differences.

- **`testing/setup.md`** — verify the setup instructions work with the real running server. Confirm the health check endpoint works. Update Postman environment variable names if any changed.
- **`testing/core-auth.md`** — run through ALL 16 checklist items with the real running server. For every request:
  1. Send the exact request shown in the doc
  2. Compare the real response with the documented expected response
  3. If they differ → **update the doc** to match reality (field names, status codes, exact messages, data structure)
  4. Mark the checklist item ✅ only after confirming it matches

---

## Phase 10: Password Recovery (Forgot/Reset)
`[x]` **Status: Complete** ✅

### Goal
Implement forgot password and reset password flows with secure token handling.

### Depends On
- Phase 1-9 (working core auth)
- [Architecture: Token System](architecture/token-system.md)
- [Architecture: Overview — Forgot Password Flow](architecture/overview.md#forgot-password-flow)

### Files to Create

#### 10.1 — `src/auth/services/token.service.ts`
Implement token generation, hashing, verification, and invalidation.
See [Token System](architecture/token-system.md) for all methods and security model.

#### 10.2 — Email Adapter
- `src/auth/adapters/email/email.adapter.interface.ts` — `IEmailAdapter` interface with `sendEmail(to, subject, html, text)` method
- `src/auth/adapters/email/console.adapter.ts` — development adapter that logs email content to console
- `src/auth/adapters/email/nodemailer.adapter.ts` — production adapter using Nodemailer SMTP

#### 10.3 — `src/auth/services/email.service.ts`
Compose and send password reset / verification emails.
- `sendPasswordReset(email, token, config)` — compose HTML + plain text email with reset link
- `sendVerification(email, code, config)` — compose HTML + plain text email with OTP code
- Uses the configured email adapter (console for dev, nodemailer for production)
- Include clean, simple HTML email templates (inline styles, mobile-friendly)

#### 10.4 — `src/auth/http/controllers/password.controller.ts`
- `forgotPassword(req, res)` — call auth/token service → always return 200 (enumeration protection)
- `resetPassword(req, res)` — validate token, reset password, revoke sessions → return 200

#### 10.5 — `src/auth/http/schemas/password.schemas.ts`
- `forgotPasswordSchema` — email or username field
- `resetPasswordSchema` — token + newPassword

#### 10.6 — Update `auth.routes.ts`
Conditionally mount forgot-password and reset-password routes when `config.passwordRecovery.enabled`.

### Verification
```bash
# 1. Enable passwordRecovery in config
# 2. POST /auth/forgot-password { email } → 200 (check console for token)
# 3. POST /auth/reset-password { token, newPassword } → 200
# 4. Login with new password → 200
# 5. Login with old password → 401
# 6. Try to reuse the token → 400 TOKEN_INVALID
# 7. Forgot-password with nonexistent email → still 200 (enumeration protection)
```

### User Docs to Write
- `docs/api/password-endpoints.md` — forgot-password + reset-password endpoint reference
- `docs/configuration/password-recovery.md` — switch config, token expiry, identifier option

### Testing Docs to Cross-Check
- **`testing/password-recovery.md`** — cross-check all 10 checklist items against real behavior. Update token format, exact error messages, and response bodies to match the actual implementation. Verify enumeration protection produces identical responses.

---

## Phase 11: Email Verification
`[x]` **Status: Complete** ✅

### Goal
Implement email verification with OTP codes.

### Depends On
- Phase 10 (token service, email service/adapters)

### Files to Create/Modify

#### 11.1 — `src/auth/http/controllers/verification.controller.ts`
- `verifyEmail(req, res)` — validate OTP code → set `isEmailVerified = true` → return 200
- `resendVerification(req, res)` — generate new code → send email → return 200

#### 11.2 — `src/auth/http/schemas/verification.schemas.ts`
- `verifyEmailSchema` — `{ code: string }`

#### 11.3 — Update `auth.service.ts`
- On registration (if emailVerification enabled): generate verification code, send email
- On login (if `requiredToLogin`): check `isEmailVerified`

#### 11.4 — Update `auth.routes.ts`
Conditionally mount verify-email and resend-verification routes when `config.emailVerification.enabled`.

### Verification
```bash
# 1. Enable emailVerification in config
# 2. Register → check console for OTP code
# 3. POST /auth/verify-email { code } → 200
# 4. re-verify → 400 (already verified or token used)
# 5. Enable requiredToLogin → register → login without verifying → 403 EMAIL_NOT_VERIFIED
# 6. Verify → login → 200
```

### User Docs to Write
- `docs/api/verification-endpoints.md` — verify-email + resend-verification
- `docs/configuration/email-verification.md` — switch config, code length, expiry, requiredToLogin

### Testing Docs to Cross-Check
- **`testing/email-verification.md`** — cross-check all 7 checklist items against real behavior. Update OTP code format, exact error messages, and verify the `requiredToLogin` flow matches. Confirm how codes appear in console adapter output.

---

## Phase 12: Google OAuth
`[x]` **Status: Complete** ✅

### Goal
Implement Google OAuth 2.0 Authorization Code flow with PKCE.

### Depends On
- Phase 1-9 (working core auth)
- [Architecture: OAuth Flow](architecture/oauth-flow.md)
- [ADR-004: No Passport.js](decisions/adr-004-no-passport.md)

### Files to Create

#### 12.1 — `src/auth/services/oauth.service.ts`
Implement the complete OAuth flow as documented in [OAuth Flow](architecture/oauth-flow.md):
- `getAuthorizationUrl(config)` — generate state + PKCE, build Google authorization URL
- `handleCallback(code, state, storedState, codeVerifier, config)` — exchange code, verify ID token, resolve account
- Account resolution: find by googleId → find by email → create new user

#### 12.2 — `src/auth/http/controllers/oauth.controller.ts`
- `redirect(req, res)` — call `oauthService.getAuthorizationUrl()`, store state/verifier in cookie, redirect
- `callback(req, res)` — extract code/state, retrieve stored state/verifier, call `oauthService.handleCallback()`, set session cookie, redirect to app

#### 12.3 — Update `auth.routes.ts`
Conditionally mount OAuth routes when `config.login.allowGoogleOAuth`.

### Verification
Requires Google Cloud Console credentials. Manual testing:
```bash
# 1. Enable Google OAuth in config with valid credentials
# 2. Visit GET /auth/google → redirects to Google
# 3. Consent on Google → redirected back to /auth/google/callback
# 4. Cookie set, user created/linked in database
# 5. GET /auth/me → see Google user data
```

### User Docs to Write
- `docs/api/oauth-endpoints.md` — Google OAuth endpoints
- `docs/configuration/google-oauth.md` — Google Cloud setup guide, credentials, callback URL

### Testing Docs to Cross-Check
- **`testing/google-oauth.md`** — cross-check all 8 checklist items. Update the redirect URL parameters, callback behavior, user data shape, and account linking scenarios to match the real OAuth implementation.

---

## Phase 13: Login History
`[ ]` **Status: Not Started**

### Goal
Track and expose login events with full metadata.

### Depends On
- Phase 1-9 (working core auth), Phase 3 (login history model/repository)

### Files to Create

#### 13.1 — `src/auth/services/login-history.service.ts`
- `record(event, userId, meta, failureReason?)` — create login history entry
- `getHistory(userId, page, limit)` — paginated query, newest first
- `cleanup(retentionDays)` — delete entries older than retention period

#### 13.2 — `src/auth/http/controllers/history.controller.ts`
- `getHistory(req, res)` — call service with pagination params → return 200 with history array

#### 13.3 — Update `auth.service.ts`
- On login success/failure: call `loginHistoryService.record()` (if enabled)
- On logout: call `loginHistoryService.record()` (if enabled)
- On password change/reset: call `loginHistoryService.record()` (if enabled)

#### 13.4 — Update `auth.routes.ts`
Conditionally mount login-history route when `config.loginHistory.enabled`.

### Verification
```bash
# 1. Enable loginHistory in config
# 2. Login successfully → check DB for login_history entry
# 3. Login with wrong password → check DB for failure entry
# 4. GET /auth/login-history → 200 with paginated history
# 5. Verify: IP, user-agent, device info, timestamp all recorded
```

### User Docs to Write
- `docs/api/history-endpoints.md` — login history endpoint
- `docs/configuration/login-history.md` — switch config, retention period

### Testing Docs to Cross-Check
- **`testing/login-history.md`** — cross-check all 10 checklist items against real behavior. Update the history entry shape, event names, device info format, and pagination response structure to match the actual implementation.

---

## Phase 14: Session/Device Management
`[ ]` **Status: Not Started**

### Goal
Allow users to see active sessions/devices and revoke specific ones.

### Depends On
- Phase 6 (session service), Phase 8 (HTTP layer)

### Files to Create

#### 14.1 — `src/auth/http/controllers/session.controller.ts`
- `listSessions(req, res)` — call `sessionService.getActiveSessions(userId)` → return 200 with sessions array (each includes device info, IP, lastActive, createdAt)
- `revokeSession(req, res)` — validate target session belongs to user → call `sessionService.revokeById()` → return 200. Mark current session in the response.

#### 14.2 — Update `auth.routes.ts`
Conditionally mount session management routes when `config.sessionManagement.enabled`.

### Verification
```bash
# 1. Enable sessionManagement in config
# 2. Login from two different user-agents
# 3. GET /auth/sessions → 200 with 2 sessions (each with device info)
# 4. DELETE /auth/sessions/:id → 200 (other session revoked)
# 5. GET /auth/sessions → 200 with 1 session remaining
```

### User Docs to Write
- `docs/api/session-endpoints.md` — list sessions + revoke session
- `docs/configuration/session-management.md` — switch config, max sessions

### Testing Docs to Cross-Check
- **`testing/session-management.md`** — cross-check all 8 checklist items. Update the session list response shape, device info fields, `isCurrent` flag behavior, and revocation endpoint path to match the real code.

---

## Phase 15: Account Lockout
`[ ]` **Status: Not Started**

### Goal
Implement temporary account lockout after N failed login attempts.

### Depends On
- Phase 5 (auth service), Phase 3 (user repository — `failedLoginAttempts`, `lockUntil` fields)

### Files to Modify

#### 15.1 — Update `auth.service.ts` login method
- Before password check: if `lockUntil > now` → throw ACCOUNT_LOCKED
- On failed password: increment `failedLoginAttempts`. If count >= `maxFailedAttempts` → set `lockUntil = now + lockDuration`
- On successful login: reset `failedLoginAttempts` to 0 and clear `lockUntil`

#### 15.2 — Update `user.model.ts`
- Conditionally include `failedLoginAttempts` and `lockUntil` fields (always present in schema for flexibility, but only used when lockout enabled)

### Verification
```bash
# 1. Enable account lockout (maxFailedAttempts: 3, lockDuration: 1 minute)
# 2. Login with wrong password 3 times → 423 ACCOUNT_LOCKED on 4th attempt
# 3. Wait 1 minute → login succeeds
# 4. Successful login resets counter
```

### User Docs to Write
Update `docs/configuration/security.md` — add account lockout section

### Testing Docs to Cross-Check
- **`testing/account-lockout.md`** — cross-check all 6 checklist items. Update the exact lockout error message, status code, and verify the lock duration and counter reset logic matches the real implementation.

---

## Phase 16: Audit Logging
`[ ]` **Status: Not Started**

### Goal
Ensure all auth events are logged through the audit logger.

### Depends On
- Phase 2 (audit-logger utility), Phase 5-15 (all services)

### Files to Modify
- Review all services and add `auditLog()` calls for:
  - Registration (success)
  - Login (success, failure — with reason)
  - Logout
  - Password change
  - Password reset
  - Email verification
  - Session revocation
  - Account lockout
  - OAuth login

### Verification
- Start server, perform all auth operations
- Verify structured JSON log output in console for each event

### User Docs to Write
None (internal feature — mentioned in security docs).

---

## Phase 17: Module Entry Point & Mount Helper
`[ ]` **Status: Not Started**

### Goal
Create the clean entry point that developers use to mount the auth module.

### Depends On
- Phase 1-16 (everything implemented)

### Files to Create

#### 17.1 — `src/auth/index.ts`

**Must include:**
- `createAuthRouter(config?: Partial<AuthConfig>): Router` — the main function:
  1. Merge user config with defaults
  2. Validate config (check required env vars)
  3. Initialize repositories (with MongoDB models)
  4. Initialize services (with repositories and config)
  5. Initialize controllers (with services and config)
  6. Build validation schemas (from config)
  7. Build and return Express Router with all routes mounted
- Export `AuthConfig` type for TypeScript users
- Export any other types users might need

**Usage by developer:**
```typescript
import { createAuthRouter } from './auth';
app.use(createAuthRouter({ /* optional overrides */ }));
```

### Verification
- Update `app.ts` to use `createAuthRouter()`
- Verify all endpoints still work exactly as before

### User Docs to Write

#### `docs/getting-started/project-structure.md`
- Explain the `src/auth/` folder for kit users
- Entry point: `index.ts` with `createAuthRouter()`

---

## Phase 18: User-Facing Documentation
`[ ]` **Status: Not Started**

### Goal
Complete all remaining user-facing docs in `docs/`.

### Depends On
- Phase 1-17 (everything implemented and working)

### Files to Create

#### Index & Overview
- `docs/README.md` — main index with links to all doc sections

#### Configuration Reference
- `docs/configuration/overview.md` — how the config system works
- `docs/configuration/registration.md` — registration fields and validation
- `docs/configuration/login.md` — login identifiers and options
- `docs/configuration/sessions.md` — cookie and session settings
- `docs/configuration/security.md` — rate limiting, lockout, CSRF, helmet
- *(password-recovery, email-verification, google-oauth, login-history, session-management already written in earlier phases)*

#### API Reference
- `docs/api/error-codes.md` — complete error code reference table
- *(overview, auth-endpoints, password-endpoints, verification-endpoints, oauth-endpoints, session-endpoints, history-endpoints already written in earlier phases)*

#### Guides
- `docs/guides/adding-custom-fields.md` — step-by-step guide
- `docs/guides/custom-email-provider.md` — write a new email adapter
- `docs/guides/custom-database.md` — implement repository interfaces for a new DB
- `docs/guides/extending-middleware.md` — add custom middleware
- `docs/guides/modifying-flows.md` — customize auth flows
- `docs/guides/deployment.md` — production deployment checklist

#### Security
- `docs/security/overview.md` — all security measures summary
- `docs/security/password-security.md` — password hashing details
- `docs/security/session-security.md` — session/cookie security
- `docs/security/token-security.md` — token handling security
- `docs/security/best-practices.md` — production security checklist

### Verification
- Every doc has table of contents
- Every doc has breadcrumb navigation
- Every cross-link resolves correctly
- Every API endpoint has a documented request/response example

---

## Phase 19: Final Integration Testing
`[ ]` **Status: Not Started**

### Goal
Complete end-to-end verification of all features, all config combinations. Run ALL Postman testing docs.

### Test Matrix

| Test | Switches | What to Verify |
|---|---|---|
| Core only | All optional OFF | Register, login, logout, profile, change-password |
| + Username | username enabled | Register with username, login with username |
| + Google OAuth | OAuth enabled | Google redirect, callback, account creation |
| + Password Recovery | recovery enabled | Forgot + reset password flow |
| + Email Verification | verification enabled | Verify email, required-to-login |
| + Login History | history enabled | Events recorded, history endpoint |
| + Session Management | management enabled | List sessions, revoke device |
| + Account Lockout | lockout enabled | Lock after failures, unlock after timeout |
| Everything ON | All switches ON | Full feature set works together |
| Security sweep | All ON | Rate limiting, enumeration protection, CSRF |

### Verification Steps
1. **TypeScript compilation:** `npx tsc --noEmit` — zero errors
2. **Start server:** `npm run dev` — no startup errors
3. **Run test matrix:** test each combination above
4. **Security checks:**
   - Login enumeration: same error for wrong email vs wrong password
   - Forgot-password enumeration: same response for existing vs non-existing email
   - Rate limiting triggers correctly on all protected endpoints
   - Session cookie has HttpOnly, Secure (with HTTPS), SameSite flags
   - Tokens are single-use and expire correctly

### Testing Docs — Final Cross-Check (ALL docs)

This is the final pass. Run through **every** `testing/` doc and ensure 100% accuracy against the real code:

1. **`testing/setup.md`** — re-verify setup instructions still work
2. **`testing/core-auth.md`** — re-run all 16 checks, confirm no drift from earlier phases
3. **`testing/password-recovery.md`** — re-run all 10 checks
4. **`testing/email-verification.md`** — re-run all 7 checks
5. **`testing/google-oauth.md`** — re-run all 8 checks
6. **`testing/login-history.md`** — re-run all 10 checks
7. **`testing/session-management.md`** — re-run all 8 checks
8. **`testing/account-lockout.md`** — re-run all 6 checks
9. **`testing/security-tests.md`** — cross-check all 13 security checklist items against real behavior
10. **`testing/full-flow-scenarios.md`** — run all 5 end-to-end scenarios, complete the 12-item master checklist

> ⚠️ **Every checklist item must be marked ✅ or the doc must be updated if the behavior differs.** Do NOT leave any doc with outdated examples.

---

## Phase 20: Final Polish & README
`[ ]` **Status: Not Started**

### Goal
Final cleanup, README for GitHub, and ensuring everything is production-ready.

### Tasks

1. **Clean up all TODO comments** — search codebase, resolve all
2. **Review all error messages** — ensure consistent, user-friendly, non-leaking
3. **Review all audit logging** — ensure all events are logged
4. **Update `dev-docs/progress/changelog.md`** — document all phases completed
5. **Write root `README.md`** — GitHub-facing README:
   - Project title and description
   - Feature highlights (badge-style list)
   - Quick start (3-step install)
   - Link to full docs
   - Tech stack badges
   - License
6. **Final `npm audit`** — ensure zero vulnerabilities
7. **Build check:** `npm run build` — production build compiles without errors

### Verification
- README rendered correctly on GitHub
- All docs accessible and cross-linked
- `npm run build` succeeds
- `npm audit` shows 0 vulnerabilities
- `npx tsc --noEmit` shows 0 errors
- Fresh clone → install → configure → start → register → login works

---

> 📖 **Index of Related Docs:**
> - [Architecture Overview](architecture/overview.md) — system design
> - [Config System](architecture/config-system.md) — how switches work
> - [Database Design](architecture/database-design.md) — all collections
> - [Session System](architecture/session-system.md) — session lifecycle
> - [Token System](architecture/token-system.md) — token security
> - [OAuth Flow](architecture/oauth-flow.md) — Google OAuth
> - [Error Handling](architecture/error-handling.md) — error flow
> - [Coding Standards](conventions/coding-standards.md) — code patterns
> - [API Response Format](conventions/api-response-format.md) — response envelope
> - [OWASP Checklist](references/owasp-checklist.md) — security requirements
> - [Dependency Audit](references/dependency-audit.md) — package decisions
> - [Postman Testing Guide](../testing/README.md) — complete Postman testing docs
> - [Project Introduction](../Project_introduction.md) — complete project context
