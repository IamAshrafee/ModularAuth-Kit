[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Coding Standards

Naming rules, file patterns, TypeScript conventions, and general coding practices for the ModularAuth-Kit project.

---

## Table of Contents

- [TypeScript Configuration](#typescript-configuration)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Import Order](#import-order)
- [Function Patterns](#function-patterns)
- [Error Handling](#error-handling)
- [Async/Await](#asyncawait)
- [Comments](#comments)
- [Prohibited Patterns](#prohibited-patterns)

---

## TypeScript Configuration

We use **strict mode** (`"strict": true` in tsconfig.json). This enables:
- `strictNullChecks` — no implicit null/undefined
- `noImplicitAny` — all types must be explicit or inferred
- `strictFunctionTypes` — correct function type variance
- `strictPropertyInitialization` — class properties must be initialized

**Rule:** Never use `@ts-ignore` or `any` unless absolutely necessary and documented with a comment explaining why.

---

## Naming Conventions

### Files

| Category | Pattern | Example |
|---|---|---|
| Models | `kebab-case.model.ts` | `user.model.ts`, `login-history.model.ts` |
| Services | `kebab-case.service.ts` | `auth.service.ts`, `session.service.ts` |
| Controllers | `kebab-case.controller.ts` | `auth.controller.ts` |
| Repositories | `kebab-case.repository.ts` | `user.repository.ts` |
| Interfaces | `kebab-case.interface.ts` | `user.repository.interface.ts` |
| Adapters | `kebab-case.adapter.ts` | `nodemailer.adapter.ts` |
| Middleware | `kebab-case.ts` | `authenticate.ts`, `rate-limiter.ts` |
| Utils | `kebab-case.ts` | `api-response.ts`, `crypto.ts` |
| Types | `kebab-case.types.ts` | `auth.types.ts` |
| Constants | `kebab-case.constants.ts` | `auth.constants.ts` |

### Variables & Functions

| Category | Pattern | Example |
|---|---|---|
| Variables | `camelCase` | `sessionId`, `tokenHash`, `isEmailVerified` |
| Functions | `camelCase` | `findByEmail()`, `hashPassword()`, `sendSuccess()` |
| Boolean variables | `is/has/should` prefix | `isActive`, `hasPassword`, `shouldRotate` |
| Private fields | `camelCase` (no underscore prefix) | `passwordHash` (not `_passwordHash`) |

### Types & Interfaces

| Category | Pattern | Example |
|---|---|---|
| Interfaces | `I` prefix + `PascalCase` | `IUserRepository`, `IEmailAdapter` |
| Types | `PascalCase` | `AuthConfig`, `UserDocument`, `RegisterDto` |
| DTOs | `PascalCase` + `Dto` suffix | `CreateUserDto`, `LoginDto`, `UpdateProfileDto` |
| Enums | `PascalCase` | `TokenType`, `LoginEvent` |
| Enum values | `UPPER_SNAKE_CASE` | `TokenType.PASSWORD_RESET`, `LoginEvent.LOGIN_SUCCESS` |

### Constants

| Category | Pattern | Example |
|---|---|---|
| Error codes | `UPPER_SNAKE_CASE` | `INVALID_CREDENTIALS`, `RATE_LIMITED` |
| Config keys | `camelCase` (nested objects) | `config.session.maxAge` |
| HTTP status codes | Use named constants | `HTTP_STATUS.OK`, `HTTP_STATUS.UNAUTHORIZED` |

---

## File Organization

Every file follows this structure:

```typescript
// 1. Imports (see Import Order below)
import { Router } from 'express';
import { z } from 'zod';

// 2. Types/Interfaces (if file-local)
interface LocalType { ... }

// 3. Constants (if file-local)
const MAX_RETRIES = 3;

// 4. Main exports (classes, functions, objects)
export class AuthService { ... }

// or

export function hashPassword(password: string): Promise<string> { ... }
```

**One primary export per file.** A file can have helper functions, but it should have one clear "main thing" it exports.

---

## Import Order

Imports are grouped in this order, separated by blank lines:

```typescript
// 1. Node.js built-in modules
import { createHash, randomBytes } from 'crypto';

// 2. External packages (npm)
import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

// 3. Internal modules (our auth module)
import { AuthConfig } from '../auth.config';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface';
import { sendSuccess, sendError } from '../utils/api-response';
```

---

## Function Patterns

### Service Methods

```typescript
// Services use async methods that return data or throw errors
async login(identifier: string, password: string, meta: RequestMeta): Promise<LoginResult> {
  // 1. Validate business rules
  // 2. Perform operations
  // 3. Return result or throw AuthError
}
```

### Controller Methods

```typescript
// Controllers are thin — extract, call, respond
async login(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body; // Already validated by middleware
    const result = await this.authService.login(data.identifier, data.password, getRequestMeta(req));
    setCookieSession(res, result.sessionId);
    sendSuccess(res, 200, 'Login successful', { user: sanitizeUser(result.user) });
  } catch (error) {
    handleError(res, error);
  }
}
```

### Repository Methods

```typescript
// Repositories return data or null (never throw for "not found")
async findByEmail(email: string): Promise<UserDocument | null> {
  return this.model.findOne({ email }).select('-passwordHash');
}
```

---

## Error Handling

- **Services:** Throw `AuthError` subclasses. Never return error objects.
- **Controllers:** Catch `AuthError`, call `sendError()`. Re-throw unexpected errors for global handler.
- **Repositories:** Return `null` for "not found" cases. Throw only for actual database errors.
- **Middleware:** Send error responses directly (validation, auth, rate limiting).

See [Error Handling Architecture](../architecture/error-handling.md) for the complete error flow.

---

## Async/Await

- **Always use `async/await`** — never raw Promises with `.then()/.catch()`
- **Always handle errors** — every `await` should be inside a try/catch or the function should be called by something that catches
- **Never use `await` inside loops** if the operations are independent — use `Promise.all()` instead

```typescript
// ❌ Bad — sequential when it could be parallel
for (const session of sessions) {
  await sessionRepository.delete(session.id);
}

// ✅ Good — parallel
await Promise.all(sessions.map(s => sessionRepository.delete(s.id)));
```

---

## Comments

- **Don't comment what the code does** — the code should be self-explanatory
- **Do comment why** — explain rationale for non-obvious decisions
- **Do comment security decisions** — always explain security-related choices

```typescript
// ❌ Bad — states the obvious
// Hash the password
const hash = await argon2.hash(password);

// ✅ Good — explains why
// Use argon2id (not bcrypt) — no 72-byte password limit, memory-hard
const hash = await argon2.hash(password, { type: argon2.argon2id });

// ✅ Good — explains security decision
// Same error for both "user not found" and "wrong password" to prevent account enumeration
throw new AuthError(401, 'INVALID_CREDENTIALS', 'The email or password is incorrect');
```

---

## Prohibited Patterns

| Pattern | Why | Use Instead |
|---|---|---|
| `any` type | Defeats TypeScript's purpose | Proper types or `unknown` |
| `@ts-ignore` | Hides real errors | Fix the type error |
| `console.log` in production | Unstructured, no levels | Audit logger |
| Magic numbers/strings | Hard to maintain | Named constants |
| `var` | Function-scoped, confusing | `const` or `let` |
| Default exports | Harder to refactor, no autocomplete | Named exports |
| Nested ternary | Hard to read | `if/else` |
| `eval()` | Security risk | Never use |
| `process.exit()` in library code | Kills host process | Throw an error instead |

---

> 📖 **Related Docs:**
> - [API Response Format](api-response-format.md) — response envelope conventions
> - [Error Handling](../architecture/error-handling.md) — error class hierarchy
> - [Folder Structure](../architecture/folder-structure.md) — file naming reference
