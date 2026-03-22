[← Back to Index](README.md)

# Postman Testing — Password Recovery

Test the forgot password and reset password flows.

> **Config required:** `passwordRecovery.enabled: true`
> **Email adapter:** Use `console` adapter in development (tokens appear in server terminal)

---

## Table of Contents

- [1. Forgot Password](#1-forgot-password)
  - [1.1 Forgot Password — Existing User](#11-forgot-password--existing-user)
  - [1.2 Forgot Password — Nonexistent User (Enumeration Check)](#12-forgot-password--nonexistent-user)
- [2. Reset Password](#2-reset-password)
  - [2.1 Reset Password — Valid Token](#21-reset-password--valid-token)
  - [2.2 Reset Password — Expired Token](#22-reset-password--expired-token)
  - [2.3 Reset Password — Reused Token](#23-reset-password--reused-token)
  - [2.4 Reset Password — Invalid Token](#24-reset-password--invalid-token)
- [Verification Checklist](#verification-checklist)

---

## 1. Forgot Password

### 1.1 Forgot Password — Existing User

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/forgot-password` |
| Headers | `Content-Type: application/json` |

**Body:**
```json
{
  "email": "{{test_email}}"
}
```

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "If an account with that email exists, we've sent a password reset link",
  "data": null
}
```

**After sending:**
1. Check the **server terminal** (console email adapter) for the reset token
2. Copy the token value
3. Set it as `reset_token` in your Postman environment variables

---

### 1.2 Forgot Password — Nonexistent User

**Body:**
```json
{
  "email": "doesnotexist@example.com"
}
```

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "If an account with that email exists, we've sent a password reset link",
  "data": null
}
```

**🔒 Security Check:**
- [ ] Response is IDENTICAL to existing user (same status, same message)
- [ ] No indication whether the email exists in the system

---

## 2. Reset Password

### 2.1 Reset Password — Valid Token

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/reset-password` |
| Headers | `Content-Type: application/json` |

**Body:**
```json
{
  "token": "{{reset_token}}",
  "newPassword": "ResetPassword123!"
}
```

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

**After this test:**
- [ ] Login with OLD password → 401 (should fail)
- [ ] Login with NEW password → 200 (should succeed)
- [ ] All previous sessions should be invalidated

---

### 2.2 Reset Password — Expired Token

> **How to test:** Set `passwordRecovery.tokenExpiryMinutes: 0.1` (6 seconds), request a token, wait 10 seconds, try to use it.

**Expected Response — `400 Bad Request`:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "This reset token has expired. Please request a new one.",
    "details": []
  }
}
```

---

### 2.3 Reset Password — Reused Token

After successfully using a token in 2.1, try using the **same token** again.

**Expected Response — `400 Bad Request`:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invalid or expired reset token",
    "details": []
  }
}
```

---

### 2.4 Reset Password — Invalid Token

**Body:**
```json
{
  "token": "completelyfaketoken123456789",
  "newPassword": "NewPass123!"
}
```

**Expected Response — `400 Bad Request`:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invalid or expired reset token",
    "details": []
  }
}
```

---

## Verification Checklist

| # | Test | Result |
|---|---|---|
| 1 | Forgot password (existing user) → 200 + token in console | ⬜ |
| 2 | Forgot password (nonexistent user) → 200 (same response!) | ⬜ |
| 3 | Reset password with valid token → 200 | ⬜ |
| 4 | Login with old password after reset → 401 | ⬜ |
| 5 | Login with new password after reset → 200 | ⬜ |
| 6 | All old sessions invalidated after reset | ⬜ |
| 7 | Reset with expired token → 400 TOKEN_EXPIRED | ⬜ |
| 8 | Reset with reused token → 400 TOKEN_INVALID | ⬜ |
| 9 | Reset with fake token → 400 TOKEN_INVALID | ⬜ |
| 10 | 🔒 Enumeration: identical response for existing/nonexistent | ⬜ |

---

> **Next:** [Email Verification Tests →](email-verification.md)
