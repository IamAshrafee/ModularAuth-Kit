# Verification Endpoints

## POST /auth/verify-email

Verify email address using the OTP code sent during registration.

**Auth required:** ✅ Yes (session cookie)

**Request body:**

| Field | Type | Required |
|---|---|---|
| `code` | string | ✅ (6-digit OTP from email) |

**Success (200):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing code or already verified |
| `TOKEN_INVALID` | 400 | Code not found or already used |
| `TOKEN_EXPIRED` | 400 | Code has expired |
| `UNAUTHORIZED` | 401 | No valid session |

**Example:**

```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -H "Cookie: sid=<sessionId>" \
  -d '{"code":"847293"}'
```

---

## POST /auth/resend-verification

Request a new verification code. Invalidates any previous codes.

**Auth required:** ✅ Yes

**Request body:** None

**Success (200):**

```json
{
  "success": true,
  "message": "Verification code has been sent",
  "data": null
}
```

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Email is already verified |
| `UNAUTHORIZED` | 401 | No valid session |
| `RATE_LIMITED` | 429 | Too many requests |

**Example:**

```bash
curl -X POST http://localhost:3000/auth/resend-verification \
  -H "Cookie: sid=<sessionId>"
```
