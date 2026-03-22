# Password Endpoints

## POST /auth/forgot-password

Request a password reset email.

**Auth required:** No

> **Security:** Always returns 200, even if the email doesn't exist (enumeration protection).

**Request body:**

| Field | Type | Required |
|---|---|---|
| `identifier` | string | ✅ (email or username) |

**Success (200):**

```json
{
  "success": true,
  "message": "If an account exists with that identifier, a password reset link has been sent",
  "data": null
}
```

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing identifier |
| `RATE_LIMITED` | 429 | Too many requests |

**Example:**

```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com"}'
```

---

## POST /auth/reset-password

Reset password using the token received via email.

**Auth required:** No

**Request body:**

| Field | Type | Required |
|---|---|---|
| `token` | string | ✅ (64-char hex from email) |
| `newPassword` | string | ✅ (must pass password policy) |

**Success (200):**

```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "data": null
}
```

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing fields or weak password |
| `TOKEN_INVALID` | 400 | Token not found or already used |
| `TOKEN_EXPIRED` | 400 | Token has expired |
| `RATE_LIMITED` | 429 | Too many requests |

**Example:**

```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-email>","newPassword":"NewPass5678!"}'
```
