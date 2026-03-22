[← Back to Index](README.md)

# Postman Testing — Full Flow Scenarios

End-to-end scenarios that combine multiple features to simulate real-world usage.

> **Config required:** All features enabled for the complete scenarios.

---

## Table of Contents

- [Scenario 1: New User — Full Registration Flow](#scenario-1-new-user--full-registration-flow)
- [Scenario 2: Forgot Password — Complete Recovery](#scenario-2-forgot-password--complete-recovery)
- [Scenario 3: Multi-Device User](#scenario-3-multi-device-user)
- [Scenario 4: Security Attack Simulation](#scenario-4-security-attack-simulation)
- [Scenario 5: Google OAuth + Existing Account Linking](#scenario-5-google-oauth--existing-account-linking)
- [Master Verification Checklist](#master-verification-checklist)

---

## Scenario 1: New User — Full Registration Flow

**Config:** All features enabled with `emailVerification.requiredToLogin: true`

```
Step 1:  POST /auth/register { email, password, username, fullName }
         → 201 + cookie + OTP code in server console
         
Step 2:  GET /auth/me
         → 200 + isEmailVerified: false
         
Step 3:  POST /auth/logout → 200

Step 4:  POST /auth/login { email, password }
         → 403 EMAIL_NOT_VERIFIED (login blocked!)
         
Step 5:  POST /auth/login { email, password }
         → 403 again (need to verify first)
         
Step 6:  (somehow get a session — register again or use a special flow)
         POST /auth/verify-email { code: <from console> }
         → 200 + email verified
         
Step 7:  POST /auth/login { email, password }
         → 200 + cookie (login now works!)
         
Step 8:  GET /auth/me
         → 200 + isEmailVerified: true
         
Step 9:  GET /auth/login-history
         → shows: login_failure (step 4), login_failure (step 5), login_success (step 7)
```

---

## Scenario 2: Forgot Password — Complete Recovery

```
Step 1:  POST /auth/login { email, password }
         → 200 + cookie (establish current session)

Step 2:  POST /auth/forgot-password { email }
         → 200 + token in server console

Step 3:  POST /auth/reset-password { token, newPassword: "NewPass123!" }
         → 200

Step 4:  GET /auth/me (with old cookie)
         → 401 (session was revoked by password reset!)

Step 5:  POST /auth/login { email, password: "NewPass123!" }
         → 200 + new cookie

Step 6:  GET /auth/login-history
         → shows: password_reset event
```

---

## Scenario 3: Multi-Device User

```
Step 1:  POST /auth/login (User-Agent: "Chrome on Windows")
         → 200 + cookie A

Step 2:  POST /auth/login (User-Agent: "Safari on iPhone")
         → 200 + cookie B

Step 3:  POST /auth/login (User-Agent: "Firefox on Android")
         → 200 + cookie C

Step 4:  GET /auth/sessions (using cookie A)
         → 200 + 3 sessions with different device info
         → session A marked as isCurrent: true

Step 5:  DELETE /auth/sessions/<sessionId-B> (using cookie A)
         → 200 (iPhone session revoked)

Step 6:  GET /auth/me (using cookie B)
         → 401 (session B was revoked)

Step 7:  GET /auth/sessions (using cookie A)
         → 200 + 2 sessions remaining

Step 8:  POST /auth/logout-all (using cookie A)
         → 200 + all sessions gone

Step 9:  GET /auth/me (using cookie C)
         → 401 (all sessions revoked)
```

---

## Scenario 4: Security Attack Simulation

### 4.1 — Brute Force Login Attack

```
Step 1:  POST /auth/login { wrong password } × 5
         → 401 INVALID_CREDENTIALS each time

Step 2:  If rate limit enabled (default: 5/15min):
         → 429 RATE_LIMITED on the 6th attempt

Step 3:  If account lockout enabled (maxFailedAttempts: 5):
         → 423 ACCOUNT_LOCKED on the 6th attempt (even with correct password)

Step 4:  Wait for lockout/rate-limit to expire

Step 5:  POST /auth/login { correct password }
         → 200 (account accessible again)
```

### 4.2 — Session Hijacking Attempt

```
Step 1:  Login → get real cookie

Step 2:  Try fake cookie: Cookie: sid=aaaa...fabricated
         → 401 (fake session rejected)

Step 3:  Try expired cookie (from previous test)
         → 401 (expired session rejected)

Step 4:  Try another user's session cookie
         → can't access first user's data (session belongs to other user)
```

### 4.3 — Token Replay Attack

```
Step 1:  POST /auth/forgot-password → get token A

Step 2:  POST /auth/forgot-password → get token B (token A invalidated!)

Step 3:  POST /auth/reset-password { token: A }
         → 400 TOKEN_INVALID (old token invalidated)

Step 4:  POST /auth/reset-password { token: B }
         → 200 (latest token works)

Step 5:  POST /auth/reset-password { token: B }
         → 400 TOKEN_INVALID (single-use — already consumed)
```

---

## Scenario 5: Google OAuth + Existing Account Linking

```
Step 1:  POST /auth/register { email: "myemail@gmail.com", password }
         → 201 (user created with email/password)

Step 2:  GET /auth/google → browser flow with same Gmail account
         → Google account linked to existing user (googleId + avatar added)

Step 3:  GET /auth/me
         → shows both email + googleId + avatar
         → isEmailVerified: true (Google verified it)

Step 4:  POST /auth/logout → clear session

Step 5:  POST /auth/login { email: "myemail@gmail.com", password }
         → 200 (password login still works)

Step 6:  POST /auth/logout → clear session

Step 7:  GET /auth/google → browser flow
         → 200 (Google login also works — same account)
```

---

## Master Verification Checklist

After completing all scenarios:

| # | Verification | Result |
|---|---|---|
| 1 | Registration → verify email → login flow works end-to-end | ⬜ |
| 2 | Forgot → reset → re-login flow works + old sessions revoked | ⬜ |
| 3 | Multi-device sessions: list, revoke individual, revoke all | ⬜ |
| 4 | Rate limiting blocks rapid requests | ⬜ |
| 5 | Account lockout blocks after N failures | ⬜ |
| 6 | Fake/expired session cookies properly rejected | ⬜ |
| 7 | Token invalidation works (old tokens, used tokens) | ⬜ |
| 8 | Google OAuth links correctly to existing email accounts | ⬜ |
| 9 | Login history records all event types | ⬜ |
| 10 | All security checks pass (enumeration, headers, cookie flags) | ⬜ |
| 11 | No `passwordHash` leaked in any response | ⬜ |
| 12 | Disabled features return 404 (routes not mounted) | ⬜ |

---

> 🎉 **All tests passing?** The auth module is production-ready!
