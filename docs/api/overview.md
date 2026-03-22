# API Overview

ModularAuth-Kit API reference. All endpoints return JSON with a consistent envelope format.

---

## Authentication Method

All protected endpoints use **cookie-based sessions**. After login or registration, the server sets an `HttpOnly` cookie (`sid` by default). The browser sends this cookie automatically on subsequent requests.

**No tokens or Authorization headers needed** — cookies handle it.

---

## Response Format

### Success

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable description",
    "details": []
  }
}
```

---

## Error Codes

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `TOKEN_EXPIRED` | 400 | Reset/verification token expired |
| `TOKEN_INVALID` | 400 | Token invalid or already used |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Not allowed |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate (email/username exists) |
| `ACCOUNT_LOCKED` | 423 | Too many failed attempts |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Base URL

All auth endpoints are mounted at `/auth/` by default (configurable).
