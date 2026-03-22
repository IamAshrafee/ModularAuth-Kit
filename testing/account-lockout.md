[← Back to Index](README.md)

# Postman Testing — Account Lockout

Test temporary account lockout after failed login attempts.

> **Config required:** `security.accountLockout.enabled: true`
> **Recommended test config:** `maxFailedAttempts: 3`, `lockDurationMinutes: 1`

---

## Table of Contents

- [1. Trigger Lockout](#1-trigger-lockout)
- [2. Verify Lockout](#2-verify-lockout)
- [3. Auto-Unlock After Duration](#3-auto-unlock-after-duration)
- [4. Counter Reset on Success](#4-counter-reset-on-success)
- [Verification Checklist](#verification-checklist)

---

## 1. Trigger Lockout

Send login requests with **wrong passwords** (3 times with maxFailedAttempts: 3):

**Body (each request):**
```json
{
  "email": "{{test_email}}",
  "password": "WrongPassword1!"
}
```

- Attempt 1 → `401 INVALID_CREDENTIALS`
- Attempt 2 → `401 INVALID_CREDENTIALS`
- Attempt 3 → `401 INVALID_CREDENTIALS` (counter hits max, account locked)

---

## 2. Verify Lockout

**Attempt 4 (even with correct password):**
```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

**Expected Response — `423 Locked`:**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to too many failed attempts. Please try again later.",
    "details": []
  }
}
```

---

## 3. Auto-Unlock After Duration

1. Wait for the lock duration (1 minute with test config)
2. Login with correct password

**Expected:** `200 OK` — account unlocked, login successful, failed counter reset.

---

## 4. Counter Reset on Success

1. Fail 2 times (below max)
2. Login with correct password → 200 (counter resets to 0)
3. Fail 2 more times
4. Login with correct password → 200 (not locked — counter was reset)

---

## Verification Checklist

| # | Test | Result |
|---|---|---|
| 1 | Failed attempts below max → 401 INVALID_CREDENTIALS | ⬜ |
| 2 | Failed attempts at max → account locked → 423 | ⬜ |
| 3 | Correct password during lockout → still 423 | ⬜ |
| 4 | After lock duration → login succeeds | ⬜ |
| 5 | Successful login resets failed counter | ⬜ |
| 6 | Disabled feature → no lockout (just INVALID_CREDENTIALS) | ⬜ |

---

> **Next:** [Security Tests →](security-tests.md)
