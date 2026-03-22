# Error Codes Reference

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password (same message for both) |
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Email or username already exists |
| `ACCOUNT_LOCKED` | 423 | Account locked after too many failed attempts |
| `EMAIL_NOT_VERIFIED` | 403 | Email must be verified before login |
| `RATE_LIMITED` | 429 | Too many requests |
| `TOKEN_INVALID` | 400 | Invalid or expired reset/verification token |
| `TOKEN_EXPIRED` | 400 | Token has expired |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Validation Error Details

When `code` is `VALIDATION_ERROR`, the `details` array contains specific field errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email"
      },
      {
        "field": "password",
        "message": "String must contain at least 8 character(s)"
      }
    ]
  }
}
```

## Security Notes

- `INVALID_CREDENTIALS` uses the **same message** for "user not found" and "wrong password" to prevent email enumeration
- `ACCOUNT_LOCKED` does not reveal how many attempts remain
- `RATE_LIMITED` includes `Retry-After` header
