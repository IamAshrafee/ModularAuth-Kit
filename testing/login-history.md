[← Back to Index](README.md)

# Postman Testing — Login History

Test the login history recording and retrieval.

> **Config required:** `loginHistory.enabled: true`

---

## Table of Contents

- [1. Trigger Events](#1-trigger-events)
- [2. Get Login History](#2-get-login-history)
- [3. Pagination](#3-pagination)
- [Verification Checklist](#verification-checklist)

---

## 1. Trigger Events

Before querying history, generate events by performing these actions:
1. Login successfully (event: `login_success`)
2. Login with wrong password (event: `login_failure`)
3. Change password (event: `password_change`)
4. Logout (event: `logout`)

---

## 2. Get Login History

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{base_url}}{{auth_prefix}}/login-history?page=1&limit=10` |
| Auth | Cookie (must be logged in) |

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Login history retrieved",
  "data": {
    "history": [
      {
        "event": "login_success",
        "method": "password",
        "ipAddress": "127.0.0.1",
        "device": {
          "browser": "PostmanRuntime 7.36",
          "os": "Other",
          "type": "desktop"
        },
        "timestamp": "2026-03-22T07:45:00.000Z"
      },
      {
        "event": "login_failure",
        "method": "password",
        "failureReason": "invalid_password",
        "ipAddress": "127.0.0.1",
        "device": { "..." },
        "timestamp": "2026-03-22T07:44:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

---

## 3. Pagination

Test with `?page=1&limit=2` to verify pagination works.

---

## Verification Checklist

| # | Test | Result |
|---|---|---|
| 1 | Successful login creates `login_success` entry | ⬜ |
| 2 | Failed login creates `login_failure` entry with reason | ⬜ |
| 3 | Password change creates `password_change` entry | ⬜ |
| 4 | Logout creates `logout` entry | ⬜ |
| 5 | History ordered newest-first | ⬜ |
| 6 | Device info (browser, OS, type) recorded correctly | ⬜ |
| 7 | IP address recorded | ⬜ |
| 8 | Pagination works correctly | ⬜ |
| 9 | Not authenticated → 401 | ⬜ |
| 10 | Disabled feature → 404 (route not mounted) | ⬜ |

---

> **Next:** [Session Management Tests →](session-management.md)
