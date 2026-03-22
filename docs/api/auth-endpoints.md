# Auth Endpoints

All endpoints are prefixed with `/auth`.

---

## POST /auth/register

Create a new user account.

**Auth required:** No

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | ✅ | Valid email, max 254 chars |
| `password` | string | ✅ | Min 8 chars by default, policy-configurable |
| `username` | string | Config | Only if `registration.fields.username.enabled` |
| `fullName` | string | Config | Only if `registration.fields.fullName.enabled` |
| `firstName` | string | Config | Only if `registration.fields.firstName.enabled` |
| `lastName` | string | Config | Only if `registration.fields.lastName.enabled` |

**Success (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isEmailVerified": false,
      "failedLoginAttempts": 0,
      "createdAt": "2026-03-22T08:00:00.000Z",
      "updatedAt": "2026-03-22T08:00:00.000Z"
    }
  }
}
```

**Response headers:** `Set-Cookie: sid=<sessionId>; HttpOnly; Secure; SameSite=Lax`

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid or missing fields |
| `CONFLICT` | 409 | Email or username already exists |
| `RATE_LIMITED` | 429 | Too many registration attempts |

**Example:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Test1234!"}'
```

---

## POST /auth/login

Authenticate with email/username and password.

**Auth required:** No

**Request body:**

| Field | Type | Required |
|---|---|---|
| `identifier` | string | ✅ (email or username) |
| `password` | string | ✅ |

**Success (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isEmailVerified": false,
      "createdAt": "2026-03-22T08:00:00.000Z",
      "updatedAt": "2026-03-22T08:00:00.000Z"
    }
  }
}
```

**Response headers:** `Set-Cookie: sid=<sessionId>; HttpOnly; Secure; SameSite=Lax`

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing identifier or password |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password (same message for both) |
| `EMAIL_NOT_VERIFIED` | 403 | Verification required to login |
| `ACCOUNT_LOCKED` | 423 | Too many failed login attempts |
| `RATE_LIMITED` | 429 | Too many login attempts |

**Example:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com","password":"Test1234!"}'
```

---

## POST /auth/logout

Log out the current session.

**Auth required:** ✅ Yes (session cookie)

**Request body:** None

**Success (200):**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Response headers:** Cookie cleared

**Example:**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Cookie: sid=<sessionId>"
```

---

## POST /auth/logout-all

Log out all sessions for the current user (all devices).

**Auth required:** ✅ Yes

**Request body:** None

**Success (200):**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/auth/logout-all \
  -H "Cookie: sid=<sessionId>"
```

---

## GET /auth/me

Get the current user's profile.

**Auth required:** ✅ Yes

**Success (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "isEmailVerified": false,
      "createdAt": "2026-03-22T08:00:00.000Z",
      "updatedAt": "2026-03-22T08:00:00.000Z"
    }
  }
}
```

**Errors:**

| Code | Status | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | No valid session |

**Example:**

```bash
curl http://localhost:3000/auth/me \
  -H "Cookie: sid=<sessionId>"
```

---

## PATCH /auth/me

Update the current user's profile.

**Auth required:** ✅ Yes

**Request body:** (all optional, only enabled fields accepted)

| Field | Type | Notes |
|---|---|---|
| `username` | string | Only if username is enabled |
| `fullName` | string | Only if fullName is enabled |
| `firstName` | string | Only if firstName is enabled |
| `lastName` | string | Only if lastName is enabled |

**Success (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { }
  }
}
```

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid field values |
| `UNAUTHORIZED` | 401 | No valid session |
| `CONFLICT` | 409 | Username already taken |

**Example:**

```bash
curl -X PATCH http://localhost:3000/auth/me \
  -H "Content-Type: application/json" \
  -H "Cookie: sid=<sessionId>" \
  -d '{"fullName":"John Doe"}'
```

---

## POST /auth/change-password

Change the current user's password. Revokes all sessions (forces re-login).

**Auth required:** ✅ Yes

**Request body:**

| Field | Type | Required |
|---|---|---|
| `currentPassword` | string | ✅ |
| `newPassword` | string | ✅ |

**Success (200):**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Response headers:** Cookie cleared (all sessions revoked)

**Errors:**

| Code | Status | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing fields or weak password |
| `UNAUTHORIZED` | 401 | No valid session |
| `INVALID_CREDENTIALS` | 401 | Current password is wrong |

**Example:**

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: sid=<sessionId>" \
  -d '{"currentPassword":"Test1234!","newPassword":"NewPass5678!"}'
```
