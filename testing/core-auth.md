[← Back to Index](README.md) · [Setup Guide](setup.md)

# Postman Testing — Core Auth

Test all core authentication endpoints: Register, Login, Logout, Profile, and Change Password.

> **Config required:** None — these endpoints are always active.

---

## Table of Contents

- [1. Register](#1-register)
  - [1.1 Register — Success (email + password only)](#11-register--success-email--password-only)
  - [1.2 Register — Success (with optional fields)](#12-register--success-with-optional-fields)
  - [1.3 Register — Validation Errors](#13-register--validation-errors)
  - [1.4 Register — Duplicate Email](#14-register--duplicate-email)
  - [1.5 Register — Duplicate Username](#15-register--duplicate-username)
- [2. Login](#2-login)
  - [2.1 Login — Success (email)](#21-login--success-email)
  - [2.2 Login — Success (username)](#22-login--success-username)
  - [2.3 Login — Wrong Password](#23-login--wrong-password)
  - [2.4 Login — Nonexistent User](#24-login--nonexistent-user)
- [3. Get Profile](#3-get-profile)
  - [3.1 Profile — Authenticated](#31-profile--authenticated)
  - [3.2 Profile — Not Authenticated](#32-profile--not-authenticated)
- [4. Update Profile](#4-update-profile)
- [5. Change Password](#5-change-password)
  - [5.1 Change Password — Success](#51-change-password--success)
  - [5.2 Change Password — Wrong Current Password](#52-change-password--wrong-current-password)
- [6. Logout](#6-logout)
  - [6.1 Logout — Single Session](#61-logout--single-session)
  - [6.2 Logout — All Sessions](#62-logout--all-sessions)
- [Verification Checklist](#verification-checklist)

---

## 1. Register

### 1.1 Register — Success (email + password only)

**Postman Setup:**
| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/register` |
| Headers | `Content-Type: application/json` |

**Body (raw JSON):**
```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

**Expected Response — `201 Created`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "testuser@example.com",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "2026-03-22T07:30:00.000Z",
      "updatedAt": "2026-03-22T07:30:00.000Z"
    }
  }
}
```

**Check these things:**
- [ ] Status code is `201`
- [ ] `success` is `true`
- [ ] `data.user` does NOT contain `passwordHash`
- [ ] Response has `Set-Cookie` header with `sid=...`
- [ ] Cookie has `HttpOnly` flag
- [ ] Cookie has `Path=/`

---

### 1.2 Register — Success (with optional fields)

> **Requires:** `username`, `fullName`, `firstName`, or `lastName` enabled in config.

**Body (raw JSON):**
```json
{
  "email": "testuser2@example.com",
  "password": "MySecure456!",
  "username": "johndoe",
  "fullName": "John Doe"
}
```

**Expected Response — `201 Created`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "email": "testuser2@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Check these things:**
- [ ] Optional fields appear in response only if they are enabled in config
- [ ] Username is stored lowercase

---

### 1.3 Register — Validation Errors

**Body (raw JSON) — Invalid data:**
```json
{
  "email": "not-an-email",
  "password": "123"
}
```

**Expected Response — `400 Bad Request`:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email" },
      { "field": "password", "message": "String must contain at least 8 character(s)" }
    ]
  }
}
```

**Check these things:**
- [ ] Status code is `400`
- [ ] `error.code` is `"VALIDATION_ERROR"`
- [ ] `error.details` contains field-level errors
- [ ] No `Set-Cookie` header

---

### 1.4 Register — Duplicate Email

**Body (raw JSON) — Same email as 1.1:**
```json
{
  "email": "{{test_email}}",
  "password": "AnotherPass123!"
}
```

**Expected Response — `409 Conflict`:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered",
    "details": []
  }
}
```

---

### 1.5 Register — Duplicate Username

> **Requires:** `username` enabled in config.

**Body — Same username as 1.2:**
```json
{
  "email": "unique@example.com",
  "password": "MySecure789!",
  "username": "johndoe"
}
```

**Expected Response — `409 Conflict`:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Username already taken",
    "details": []
  }
}
```

---

## 2. Login

### 2.1 Login — Success (email)

**Postman Setup:**
| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/login` |
| Headers | `Content-Type: application/json` |

**Body (raw JSON):**
```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "testuser@example.com",
      "isEmailVerified": false,
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Check these things:**
- [ ] Status code is `200`
- [ ] `Set-Cookie` header present
- [ ] `data.user` does NOT contain `passwordHash`

---

### 2.2 Login — Success (username)

> **Requires:** `login.identifiers` includes `'username'`.

**Body:**
```json
{
  "username": "johndoe",
  "password": "MySecure456!"
}
```

**Expected:** 200 OK with user data.

---

### 2.3 Login — Wrong Password

**Body:**
```json
{
  "email": "{{test_email}}",
  "password": "WrongPassword123!"
}
```

**Expected Response — `401 Unauthorized`:**
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

**🔒 Security Check:** The error message must be IDENTICAL to "nonexistent user" (test 2.4). This prevents account enumeration.

---

### 2.4 Login — Nonexistent User

**Body:**
```json
{
  "email": "doesnotexist@example.com",
  "password": "SomePass123!"
}
```

**Expected Response — `401 Unauthorized`:**
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

**🔒 Security Check:**
- [ ] Same error code as wrong password: `INVALID_CREDENTIALS`
- [ ] Same message as wrong password (word for word)
- [ ] Same HTTP status as wrong password: 401

---

## 3. Get Profile

### 3.1 Profile — Authenticated

> **Prerequisite:** Login first (cookie should be set automatically).

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{base_url}}{{auth_prefix}}/me` |
| Headers | *(none extra — cookie is sent automatically)* |

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "user": { "id": "...", "email": "...", "..." }
  }
}
```

---

### 3.2 Profile — Not Authenticated

> **Prerequisite:** Clear cookies first (Cookies button → delete `sid`).

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{base_url}}{{auth_prefix}}/me` |

**Expected Response — `401 Unauthorized`:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": []
  }
}
```

---

## 4. Update Profile

> **Prerequisite:** Logged in.

| Field | Value |
|---|---|
| Method | `PATCH` |
| URL | `{{base_url}}{{auth_prefix}}/me` |
| Headers | `Content-Type: application/json` |

**Body (raw JSON):**
```json
{
  "fullName": "Updated Name"
}
```

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": { "id": "...", "email": "...", "fullName": "Updated Name", "..." }
  }
}
```

**Check:** Only enabled fields can be updated. Disabled fields are silently ignored.

---

## 5. Change Password

### 5.1 Change Password — Success

> **Prerequisite:** Logged in.

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/change-password` |
| Headers | `Content-Type: application/json` |

**Body:**
```json
{
  "currentPassword": "{{test_password}}",
  "newPassword": "NewSecure789!"
}
```

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**After this test:**
- [ ] Other sessions for this user should be revoked
- [ ] Login with old password should fail
- [ ] Login with new password should succeed

> **Remember:** Update your `test_password` environment variable after this test!

---

### 5.2 Change Password — Wrong Current Password

**Body:**
```json
{
  "currentPassword": "WrongCurrentPassword!",
  "newPassword": "NewSecure789!"
}
```

**Expected Response — `401 Unauthorized`:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Current password is incorrect",
    "details": []
  }
}
```

---

## 6. Logout

### 6.1 Logout — Single Session

> **Prerequisite:** Logged in.

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/logout` |

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Check these things:**
- [ ] `Set-Cookie` header clears the `sid` cookie (expires in the past or max-age=0)
- [ ] Subsequent `GET /auth/me` returns 401
- [ ] Other active sessions (if any) are NOT affected

---

### 6.2 Logout — All Sessions

> **Prerequisite:** Logged in from multiple sessions (or just one — should work for both).

| Field | Value |
|---|---|
| Method | `POST` |
| URL | `{{base_url}}{{auth_prefix}}/logout-all` |

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "All sessions logged out",
  "data": null
}
```

**Check:**
- [ ] ALL sessions for this user are invalidated
- [ ] No session cookies are valid after this

---

## Verification Checklist

Run through all tests above and confirm:

| # | Test | Result |
|---|---|---|
| 1 | Register with valid data → 201 + cookie | ⬜ |
| 2 | Register with optional fields → 201 + fields present | ⬜ |
| 3 | Register with invalid data → 400 + field errors | ⬜ |
| 4 | Register duplicate email → 409 | ⬜ |
| 5 | Login with correct credentials → 200 + cookie | ⬜ |
| 6 | Login with wrong password → 401 INVALID_CREDENTIALS | ⬜ |
| 7 | Login with nonexistent user → 401 INVALID_CREDENTIALS (same message!) | ⬜ |
| 8 | Get profile with cookie → 200 + user data | ⬜ |
| 9 | Get profile without cookie → 401 | ⬜ |
| 10 | Update profile → 200 + updated data | ⬜ |
| 11 | Change password → 200, then re-login with new password | ⬜ |
| 12 | Change password with wrong current → 401 | ⬜ |
| 13 | Logout → 200, cookie cleared, profile returns 401 | ⬜ |
| 14 | Logout all → 200, all sessions invalidated | ⬜ |
| 15 | 🔒 Enumeration: same error for wrong-pass vs no-user | ⬜ |
| 16 | 🔒 No `passwordHash` in any response | ⬜ |

---

> **Next:** [Password Recovery Tests →](password-recovery.md)
