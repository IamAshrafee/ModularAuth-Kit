[← Back to Index](README.md)

# Postman Testing — Email Verification

Test the email verification and resend verification flows.

> **Config required:** `emailVerification.enabled: true`
> **Email adapter:** Use `console` adapter (OTP codes appear in server terminal)

---

## Table of Contents

- [1. Verify Email](#1-verify-email)
  - [1.1 Verify — Valid Code](#11-verify--valid-code)
  - [1.2 Verify — Wrong Code](#12-verify--wrong-code)
  - [1.3 Verify — Expired Code](#13-verify--expired-code)
  - [1.4 Verify — Already Verified](#14-verify--already-verified)
- [2. Resend Verification](#2-resend-verification)
- [3. Login Block (requiredToLogin)](#3-login-block-requiredtologin)
- [Verification Checklist](#verification-checklist)

---

## 1. Verify Email

### 1.1 Verify — Valid Code

> **Prerequisite:** Register a new user. Check server terminal for OTP code. Set it as `verification_code` environment variable.

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/verify-email` |
| Headers | `Content-Type: application/json` |
| Auth | Cookie (must be logged in) |

**Body:**
```json
{
  "code": "{{verification_code}}"
}
```

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

**After this:** `GET /auth/me` should show `isEmailVerified: true`

---

### 1.2 Verify — Wrong Code

**Body:**
```json
{
  "code": "000000"
}
```

**Expected — `400`:** `TOKEN_INVALID`

---

### 1.3 Verify — Expired Code

> Set `emailVerification.codeExpiryMinutes: 0.1` (6 seconds), register, wait, verify.

**Expected — `400`:** `TOKEN_EXPIRED`

---

### 1.4 Verify — Already Verified

After successful verification, try verifying again.

**Expected — `400`:** Appropriate error (already verified or token used)

---

## 2. Resend Verification

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/resend-verification` |
| Auth | Cookie (must be logged in) |

**Expected — `200 OK`:**
- New OTP code appears in server terminal
- Old OTP code is invalidated

---

## 3. Login Block (requiredToLogin)

> **Config:** `emailVerification.requiredToLogin: true`

1. Register new user (unverified)
2. Logout
3. Login again

**Expected — `403 Forbidden`:**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email address before logging in",
    "details": []
  }
}
```

---

## Verification Checklist

| # | Test | Result |
|---|---|---|
| 1 | Verify with valid code → 200, isEmailVerified = true | ⬜ |
| 2 | Verify with wrong code → 400 | ⬜ |
| 3 | Verify with expired code → 400 | ⬜ |
| 4 | Verify already verified → error | ⬜ |
| 5 | Resend verification → new code in console | ⬜ |
| 6 | Login blocked when unverified (if requiredToLogin) → 403 | ⬜ |
| 7 | Login allowed after verification → 200 | ⬜ |

---

> **Next:** [Google OAuth Tests →](google-oauth.md)
