[← Back to Index](../README.md) · [Architecture Overview](overview.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Error Handling

How errors are created, thrown, caught, and formatted into API responses.

---

## Table of Contents

- [Overview](#overview)
- [Error Class Hierarchy](#error-class-hierarchy)
- [Error Codes](#error-codes)
- [Error Flow](#error-flow)
- [Error Response Format](#error-response-format)
- [How Each Layer Handles Errors](#how-each-layer-handles-errors)
  - [Service Layer (Throws)](#service-layer-throws)
  - [Controller Layer (Catches)](#controller-layer-catches)
  - [Middleware Layer](#middleware-layer)
  - [Global Error Handler](#global-error-handler)
- [Validation Errors (Zod)](#validation-errors-zod)
- [Security-Sensitive Errors](#security-sensitive-errors)
- [Production vs Development](#production-vs-development)

---

## Overview

ModularAuth-Kit uses a **typed error system** where:

1. Services throw **custom error classes** with HTTP status codes and machine-readable error codes
2. Controllers catch these errors and format them into **standardized JSON responses**
3. A **global error handler** catches anything that slips through (unexpected errors)
4. **Validation errors** from Zod are automatically caught and formatted by the validate middleware

**No raw `throw new Error("something")` anywhere in the auth module.** Every error is a typed `AuthError` or subclass.

---

## Error Class Hierarchy

```
Error (built-in)
 └── AuthError (base class for all auth errors)
      ├── ValidationError (400 — input validation failures)
      ├── NotFoundError (404 — resource not found)
      └── RateLimitError (429 — too many requests)
```

### `AuthError` (Base Class)

```typescript
class AuthError extends Error {
  public readonly statusCode: number;    // HTTP status code (401, 403, 409, etc.)
  public readonly code: string;          // Machine-readable error code ('INVALID_CREDENTIALS')
  public readonly details: unknown[];    // Additional details (validation errors, etc.)

  constructor(statusCode: number, code: string, message: string, details: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
```

### `ValidationError`

```typescript
class ValidationError extends AuthError {
  constructor(details: Array<{ field: string; message: string }>) {
    super(400, 'VALIDATION_ERROR', 'Validation failed', details);
  }
}
```

### `NotFoundError`

```typescript
class NotFoundError extends AuthError {
  constructor(resource: string = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}
```

### `RateLimitError`

```typescript
class RateLimitError extends AuthError {
  constructor(retryAfterSeconds?: number) {
    super(429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
    // retryAfterSeconds can be used to set the Retry-After header
  }
}
```

---

## Error Codes

Every error has a machine-readable `code` that clients can reliably use for conditional logic.

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password/username |
| `UNAUTHORIZED` | 401 | No valid session (not logged in) |
| `FORBIDDEN` | 403 | Logged in but not allowed |
| `EMAIL_NOT_VERIFIED` | 403 | Login blocked — email not verified |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource (email/username exists) |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked (too many failures) |
| `RATE_LIMITED` | 429 | Too many requests from this IP |
| `TOKEN_EXPIRED` | 400 | Reset/verification token has expired |
| `TOKEN_INVALID` | 400 | Reset/verification token not found or already used |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Error Flow

```
Service detects error
       │
       ▼
throw new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid credentials')
       │
       ▼
Controller's try/catch block catches it
       │
       ▼
  ┌─── Is it an AuthError? ───┐
  │                            │
  │ YES                        │ NO (unexpected error)
  │                            │
  ▼                            ▼
sendError(res,              Global error handler
  error.statusCode,         catches it
  error.code,               │
  error.message,            ▼
  error.details)            sendError(res, 500,
                              'INTERNAL_ERROR',
                              'An unexpected error occurred')
       │
       ▼
Client receives:
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials",
    "details": []
  }
}
```

---

## Error Response Format

All errors follow this structure (see [API Response Format](../conventions/api-response-format.md)):

```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_ERROR_CODE",
    "message": "Human-readable error description",
    "details": []
  }
}
```

### Validation Error Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  }
}
```

---

## How Each Layer Handles Errors

### Service Layer (Throws)

Services throw typed errors when business rules are violated:

```typescript
// auth.service.ts
async login(identifier: string, password: string, requestMeta: RequestMeta) {
  const user = await this.userRepository.findByEmail(identifier);
  if (!user) {
    // IMPORTANT: Same error as wrong password (enumeration protection)
    throw new AuthError(401, 'INVALID_CREDENTIALS', 'The email or password you entered is incorrect');
  }

  const isValid = await this.passwordService.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AuthError(401, 'INVALID_CREDENTIALS', 'The email or password you entered is incorrect');
  }

  if (config.emailVerification.requiredToLogin && !user.isEmailVerified) {
    throw new AuthError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email address before logging in');
  }
  // ...
}
```

### Controller Layer (Catches)

Controllers wrap service calls in try/catch:

```typescript
// auth.controller.ts
async login(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;
    const { user, sessionId } = await authService.login(identifier, password, getRequestMeta(req));

    setCookieSession(res, sessionId);
    sendSuccess(res, 200, 'Login successful', { user: sanitizeUser(user) });

  } catch (error) {
    if (error instanceof AuthError) {
      sendError(res, error.statusCode, error.code, error.message, error.details);
    } else {
      // Unexpected error — let global handler deal with it
      throw error;
    }
  }
}
```

### Middleware Layer

**Validate middleware** catches Zod errors and formats them:

```typescript
// validate.ts middleware
function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', details);
    }
    req.body = result.data; // Replace with parsed/sanitized data
    next();
  };
}
```

**Rate limiter** sends rate limit errors:

```typescript
// When express-rate-limit triggers, it calls our custom handler:
handler: (req, res) => {
  sendError(res, 429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
}
```

**Authenticate middleware** sends auth errors:

```typescript
// authenticate.ts
if (!session) {
  return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
}
```

### Global Error Handler

A catch-all Express error handler at the end of the middleware chain:

```typescript
// Registered after all routes
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AuthError) {
    return sendError(res, error.statusCode, error.code, error.message, error.details);
  }

  // Unexpected error
  console.error('[AUTH] Unexpected error:', error);
  sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
});
```

---

## Validation Errors (Zod)

Zod validation produces structured field-level errors. Our validate middleware transforms them:

```
Zod error format:
{
  issues: [
    { code: 'too_small', path: ['password'], message: 'String must contain at least 8 character(s)' },
    { code: 'invalid_string', path: ['email'], message: 'Invalid email' }
  ]
}

Transformed to our format:
{
  "details": [
    { "field": "password", "message": "String must contain at least 8 character(s)" },
    { "field": "email", "message": "Invalid email" }
  ]
}
```

---

## Security-Sensitive Errors

Certain errors are deliberately vague to prevent information leakage:

| Scenario | What We Return | What We Don't Return |
|---|---|---|
| Login — user not found | "Invalid credentials" | ~~"User not found"~~ |
| Login — wrong password | "Invalid credentials" | ~~"Wrong password"~~ |
| Forgot password — user not found | "If an account exists, we've sent a reset email" | ~~"No user with this email"~~ |
| Register — email exists | "Email already registered" (409) | This one is intentionally explicit (user needs to know to try login) |
| Token invalid or expired | "Invalid or expired token" | ~~"Token not found"~~ or ~~"Token already used"~~ (combined) |

**Principle:** Error responses should never reveal whether an email or username exists in the system (except on registration, where it's necessary UX).

---

## Production vs Development

| Behavior | Development | Production |
|---|---|---|
| Stack traces | Included in console output | Never in responses, logged to error tracking |
| Detailed errors | Full Zod error details | Same (validation details are user-facing) |
| Internal errors | Message + stack in console | Generic "unexpected error" in response, full details in logs |
| Audit logging | Logs to console | Logs to configured audit system |

---

> 📖 **Related Docs:**
> - [API Response Format](../conventions/api-response-format.md) — the standard response envelope
> - [Architecture Overview](overview.md) — how errors flow through layers
> - [Coding Standards](../conventions/coding-standards.md) — error naming conventions
