[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# API Response Format

The standardized response envelope that every auth endpoint must follow.

---

## Table of Contents

- [Overview](#overview)
- [Success Response](#success-response)
- [Error Response](#error-response)
- [Error Codes Reference](#error-codes-reference)
- [Validation Error Details](#validation-error-details)
- [Response Helpers](#response-helpers)
- [Rules](#rules)

---

## Overview

Every API response in the auth module follows a **consistent JSON envelope**. This allows clients to build generic response handlers and know exactly what to expect.

**Two response types:** Success and Error. Distinguished by the `success` boolean field.

---

## Success Response

```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": {
    // Response payload (varies by endpoint)
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `success` | `boolean` | ✅ always | Always `true` for success responses |
| `message` | `string` | ✅ always | Human-readable message (e.g., "Login successful") |
| `data` | `object \| null` | ✅ always | Response payload. `null` if no data to return. |

### Examples

**Login success:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isEmailVerified": false,
      "createdAt": "2026-03-22T07:30:00.000Z"
    }
  }
}
```

**Logout success (no data):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## Error Response

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

| Field | Type | Required | Description |
|---|---|---|---|
| `success` | `boolean` | ✅ always | Always `false` for error responses |
| `error.code` | `string` | ✅ always | Machine-readable error code (used by client logic) |
| `error.message` | `string` | ✅ always | Human-readable error message (displayed to user) |
| `error.details` | `array` | ✅ always | Array of additional details (validation errors). Empty array if none. |

### Examples

**Invalid credentials:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The email or password you entered is incorrect",
    "details": []
  }
}
```

**Validation error:**
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

## Error Codes Reference

| Code | HTTP Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod schema validation |
| `TOKEN_EXPIRED` | 400 | Reset or verification token has expired |
| `TOKEN_INVALID` | 400 | Reset or verification token is invalid or already used |
| `INVALID_CREDENTIALS` | 401 | Wrong email/username/password combination |
| `UNAUTHORIZED` | 401 | No valid session cookie (not logged in) |
| `FORBIDDEN` | 403 | Authenticated but not allowed to perform this action |
| `EMAIL_NOT_VERIFIED` | 403 | Login blocked because email is not verified |
| `NOT_FOUND` | 404 | Requested resource not found |
| `CONFLICT` | 409 | Duplicate resource (email or username already registered) |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked due to too many failed attempts |
| `RATE_LIMITED` | 429 | Too many requests from this IP/user |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Validation Error Details

When the code is `VALIDATION_ERROR`, the `details` array contains field-level errors:

```typescript
interface ValidationDetail {
  field: string;    // Field name (dot-notation for nested: "address.city")
  message: string;  // Human-readable validation message
}
```

**Zod errors are transformed** from Zod's format into this standardized format by the `validate` middleware.

---

## Response Helpers

All controllers use two helper functions from `utils/api-response.ts`:

```typescript
// Success response
function sendSuccess(res: Response, statusCode: number, message: string, data?: unknown): void {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}

// Error response
function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details: unknown[] = []
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  });
}
```

**Rule:** Controllers never call `res.json()` directly. Always use `sendSuccess()` or `sendError()`.

---

## Rules

1. **Always include all fields.** Never omit `success`, `message`, `data`, `error.code`, `error.message`, or `error.details`.

2. **`data` is `null` when there's nothing to return.** Never omit it — always include it as `null`.

3. **`details` is always an array.** Empty array `[]` if no details — never `null` or omitted.

4. **Error messages are user-facing.** Write them as if a user will read them. No technical jargon, no stack traces.

5. **Error codes are for client logic.** Clients should switch on `error.code`, not `error.message` (messages may change; codes are stable API).

6. **Never expose internal errors.** If an unexpected error occurs, return `"INTERNAL_ERROR"` with a generic message. Log the real error server-side.

7. **Security-sensitive responses use generic messages.** Login, forgot-password, and similar endpoints return the same message/code regardless of the specific failure to prevent enumeration.

---

> 📖 **Related Docs:**
> - [Error Handling](../architecture/error-handling.md) — how errors are created and propagated
> - [Coding Standards](coding-standards.md) — naming conventions for error codes
