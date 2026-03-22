---
description: Think like an attacker — try to break the auth module by finding exploitable weaknesses
---

# Red Team / Attacker Thinking

Forget you built this. You're an attacker trying to break in. Think maliciously.

## 1. Credential Attacks

Try to:
- [ ] **Enumerate valid emails** — Register with an existing email, then with a new one. Are the error messages different? Timing different?
- [ ] **Brute-force passwords** — Send 1000 login attempts. Does rate limiting actually stop you? What if you rotate IPs?
- [ ] **Bypass account lockout** — Get locked out, then try logging in via Google OAuth. Does it bypass the lock?
- [ ] **Guess session IDs** — How much entropy do session IDs have? Could you guess one?
- [ ] **Reuse old tokens** — Use a password reset token twice. Use an expired token. Use a token from a different user.

## 2. Session Attacks

Try to:
- [ ] **Steal a session** — If you could read cookies via XSS, would they be httpOnly? Secure? SameSite?
- [ ] **Fix a session** — Can you set a session cookie BEFORE login and have the server accept it after login? (Session fixation)
- [ ] **Cross-site request** — Send a POST to /auth/change-password from a different origin. Does CSRF protection stop it?
- [ ] **Session persistence** — Logout, then replay the same session cookie. Does the server reject it?

## 3. Input Manipulation

Try to:
- [ ] **NoSQL injection** — Send `{"email": {"$gt": ""}}` to login. Does Zod catch it?
- [ ] **Oversized payload** — Send a 10MB JSON body. Does the server crash?
- [ ] **Special characters** — Register with email `<script>alert(1)</script>@test.com`. Is it stored/reflected unsanitized?
- [ ] **Unicode tricks** — Register with `admin@test.com` using a lookalike Unicode character. Does normalization prevent it?
- [ ] **Extra fields** — Send `{"email":"...", "password":"...", "role":"admin"}` to register. Is the extra field ignored?

## 4. Logic Flaws

Try to:
- [ ] **Race condition on register** — Send two simultaneous register requests with the same email. Do both succeed?
- [ ] **Password reset for unverified email** — Request a password reset for an email that hasn't been verified. Should it work?
- [ ] **Change email without verification** — Update profile to a new email. Does it bypass email verification?
- [ ] **Privilege escalation** — Can a regular user access admin-only routes?

## 5. Information Leakage

Check:
- [ ] **Error stack traces** — Do 500 errors expose file paths or stack traces?
- [ ] **Response headers** — Does the server expose technology fingerprints (X-Powered-By, Server)?
- [ ] **Timing attacks** — Does login take measurably longer for valid vs invalid emails?
- [ ] **Rate limit headers** — Do rate limit responses reveal the exact limit/window? (Helps attackers calibrate)

## 6. Report

For each finding:
- **Vulnerability**: What you found
- **Severity**: Critical / High / Medium / Low
- **Exploit steps**: How to reproduce
- **Fix**: Recommended remediation

Critical and High findings must be fixed immediately.

```bash
git add -A && git commit -m "Security: fix vulnerabilities found during red team exercise"
```
