[← Back to Index](README.md)

# Postman Testing — Security Tests

Verify that all security measures are working correctly.

---

## Table of Contents

- [1. Rate Limiting](#1-rate-limiting)
- [2. Account Enumeration Protection](#2-account-enumeration-protection)
- [3. Security Headers](#3-security-headers)
- [4. Cookie Security Flags](#4-cookie-security-flags)
- [5. Password Hash Protection](#5-password-hash-protection)
- [6. Session Security](#6-session-security)
- [Verification Checklist](#verification-checklist)

---

## 1. Rate Limiting

### Test Login Rate Limit
Default: 5 attempts per 15-minute window.

1. Send the same login request rapidly (6+ times)
2. On the 6th request:

**Expected Response — `429 Too Many Requests`:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "details": []
  }
}
```

**Check headers:**
- [ ] `Retry-After` header present
- [ ] `X-RateLimit-Limit` header shows the limit
- [ ] `X-RateLimit-Remaining` counts down

### Test Register Rate Limit
Default: 3 attempts per 60-minute window. Same approach — register 4 times.

### Test Forgot-Password Rate Limit
Default: 3 attempts per 15-minute window.

---

## 2. Account Enumeration Protection

Run these side-by-side and compare:

| Test | Request | Expected |
|---|---|---|
| Login — wrong password | `{ email: "real@email.com", password: "wrong" }` | 401 — `INVALID_CREDENTIALS` — "The email or password you entered is incorrect" |
| Login — no such user | `{ email: "fake@email.com", password: "any" }` | 401 — `INVALID_CREDENTIALS` — "The email or password you entered is incorrect" |
| Forgot — real email | `{ email: "real@email.com" }` | 200 — "If an account exists, we've sent a reset email" |
| Forgot — fake email | `{ email: "fake@email.com" }` | 200 — "If an account exists, we've sent a reset email" |

**🔒 All pairs must be identical** — same status code, same error code, same message text.

---

## 3. Security Headers

Send any request and check the **response headers**:

| Header | Expected Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` or `DENY` | Prevents clickjacking |
| `Strict-Transport-Security` | `max-age=...` | Forces HTTPS |
| `X-XSS-Protection` | `0` (disabled by Helmet v5+) | Deferred to CSP |
| `Content-Security-Policy` | Present | Controls resource loading |
| `Referrer-Policy` | `no-referrer` | Controls referrer info leakage |

All provided by Helmet when `security.helmet: true`.

---

## 4. Cookie Security Flags

After login, check the `Set-Cookie` response header:

| Flag | Expected | Purpose |
|---|---|---|
| `HttpOnly` | Present | JS can't read the cookie |
| `SameSite=Lax` | Present | CSRF mitigation |
| `Secure` | Present (in production) | HTTPS only |
| `Path=/` | Present | Available on all routes |

> **In development:** `Secure` may be absent if running on `http://localhost`.

---

## 5. Password Hash Protection

Scan EVERY API response for `passwordHash`:

| Endpoint | Should contain passwordHash? |
|---|---|
| POST /auth/register → response | ❌ NEVER |
| POST /auth/login → response | ❌ NEVER |
| GET /auth/me → response | ❌ NEVER |
| PATCH /auth/me → response | ❌ NEVER |
| GET /auth/sessions → response | ❌ NEVER |
| GET /auth/login-history → response | ❌ NEVER |

**If `passwordHash` appears in ANY response, it's a critical security bug.**

---

## 6. Session Security

### Invalid Session Cookie
Set a fake cookie: `Cookie: sid=fakesessionid12345`

**Expected:** `401 UNAUTHORIZED` — no useful info about why the session is invalid.

### Expired Session
Login, then wait for session to expire (set `session.maxAge` to a short duration for testing).

**Expected:** `401 UNAUTHORIZED` — cookie cleared in response.

### Session After Password Change
1. Login from two devices (two sessions)
2. Change password from device 1
3. Try to use device 2's session

**Expected:** Device 2's session is invalidated → 401.

---

## Verification Checklist

| # | Test | Result |
|---|---|---|
| 1 | Login rate limit triggers at configured threshold | ⬜ |
| 2 | Register rate limit triggers | ⬜ |
| 3 | Forgot-password rate limit triggers | ⬜ |
| 4 | Rate limit returns 429 with Retry-After header | ⬜ |
| 5 | 🔒 Login: same error for wrong-pass and no-user | ⬜ |
| 6 | 🔒 Forgot-password: same response for real and fake email | ⬜ |
| 7 | Security headers all present (Helmet) | ⬜ |
| 8 | Cookie: HttpOnly flag present | ⬜ |
| 9 | Cookie: SameSite=Lax present | ⬜ |
| 10 | 🔒 passwordHash NEVER appears in any response | ⬜ |
| 11 | Fake session cookie → 401 | ⬜ |
| 12 | Expired session → 401 + cookie cleared | ⬜ |
| 13 | Password change invalidates other sessions | ⬜ |

---

> **Next:** [Full Flow Scenarios →](full-flow-scenarios.md)
