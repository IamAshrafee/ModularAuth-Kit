---
description: Run a security audit on the auth module — checks OWASP Top 10, password handling, session security, input validation, and common vulnerabilities
---

# Security Audit

Comprehensive security review of the auth module against OWASP Top 10 and auth best practices.

// turbo-all

## 1. Password Security

```bash
# Verify argon2id is used, not bcrypt or plain text
grep -rn "argon2" src/auth/services/password.service.ts
```

Check:
- [ ] Passwords are hashed with argon2id (never bcrypt, SHA, MD5, or plaintext)
- [ ] `passwordHash` is never returned in API responses — grep for it:

```bash
grep -rn "passwordHash" src/auth/ --include="*.ts" | grep -v "model\|schema\|service\|type"
```

- [ ] Password validation enforces minimum complexity (check `auth.config.ts` defaults)
- [ ] Password comparison uses constant-time comparison (argon2.verify does this)

## 2. Enumeration Protection

```bash
# Check login error messages — must be identical for wrong email and wrong password
grep -rn "INVALID_CREDENTIALS\|incorrect\|not found" src/auth/services/auth.service.ts
```

Check:
- [ ] Login returns the SAME error for "user not found" and "wrong password"
- [ ] Register does NOT reveal if an email exists (or all return 409 equally)
- [ ] Forgot-password returns success even if email doesn't exist

## 3. Session Security

```bash
# Check cookie settings
grep -rn "httpOnly\|secure\|sameSite\|signed" src/auth/
```

Check:
- [ ] Cookies are httpOnly (not accessible via JavaScript)
- [ ] Cookies are signed
- [ ] SameSite is 'lax' or 'strict'
- [ ] Session ID is rotated on login (check for rotation logic)
- [ ] Sessions expire (maxAge and idleTimeout are set)
- [ ] Concurrent session limit exists (default 5)

## 4. Token Security

```bash
# Check token hashing
grep -rn "sha256\|createHash\|hash" src/auth/services/ --include="*.ts"
```

Check:
- [ ] Password reset tokens are hashed (SHA-256) before database storage
- [ ] Email verification OTPs are hashed before storage
- [ ] Tokens have expiration (check tokenExpiryMinutes)
- [ ] Tokens are single-use (deleted/invalidated after use)

## 5. Input Validation

```bash
# Check Zod schemas are applied to all endpoints
grep -rn "validate\|schema\|zod" src/auth/http/ --include="*.ts"
```

Check:
- [ ] ALL user input is validated with Zod before processing
- [ ] No raw `req.body` is passed directly to database queries
- [ ] Email format is validated
- [ ] Password length/complexity is validated
- [ ] Username format is validated (if enabled)

## 6. Rate Limiting

```bash
# Check rate limiters
grep -rn "rateLimiter\|rateLimit" src/auth/http/ --include="*.ts"
```

Check:
- [ ] Login endpoint is rate limited
- [ ] Register endpoint is rate limited
- [ ] Forgot-password is rate limited
- [ ] Rate limits are per-IP (not per-session)

## 7. CSRF Protection

```bash
grep -rn "csrf\|CSRF" src/auth/ --include="*.ts"
```

Check:
- [ ] CSRF protection is enabled by default
- [ ] State-changing endpoints (POST/PATCH/DELETE) require CSRF token
- [ ] GET endpoints don't mutate state

## 8. Security Headers

```bash
grep -rn "helmet" src/auth/ --include="*.ts"
```

Check:
- [ ] Helmet is applied (sets X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] No CORS misconfiguration (wildcard origin with credentials)

## 9. Dependency Audit

```bash
npm audit
```

Check:
- [ ] No known vulnerabilities in dependencies
- [ ] All dependencies are up to date

## 10. Report

List all findings with severity (Critical/High/Medium/Low) and fix any Critical or High issues immediately.

```bash
git add -A && git commit -m "Fix security issues found during audit"
```
