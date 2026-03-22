# Security Best Practices

Production security checklist for ModularAuth-Kit.

## Must Do

- [ ] Use HTTPS everywhere (set `session.secure: true`)
- [ ] Set a strong `SESSION_SECRET` (64+ random chars, never commit to git)
- [ ] Enable CSRF protection (`security.csrfProtection: true`)
- [ ] Enable account lockout (`security.accountLockout.enabled: true`)
- [ ] Set `NODE_ENV=production`
- [ ] Use a reverse proxy (nginx, Cloudflare) with `trust proxy` enabled
- [ ] Ensure MongoDB has authentication enabled

## Recommended

- [ ] Enable rate limiting on all auth endpoints
- [ ] Set `maxActiveSessions` to limit concurrent sessions (default 5)
- [ ] Enable email verification for production
- [ ] Use a real email provider (not console adapter)
- [ ] Monitor audit logs for suspicious activity
- [ ] Set up alerting for repeated account lockouts
- [ ] Review and rotate `SESSION_SECRET` periodically

## Common Mistakes

| Mistake | Risk | Fix |
|---|---|---|
| `session.secure: false` in prod | Session hijacking over HTTP | Set `true` + use HTTPS |
| Identical `SESSION_SECRET` across envs | Cross-env session replay | Unique secret per environment |
| No rate limiting | Brute force attacks | Enable rate limiter |
| Exposing internal errors | Information leakage | Use production error handler |
| No CSRF protection | Cross-site request forgery | Enable CSRF middleware |

## OWASP Top 10 Coverage

| OWASP Risk | Mitigation |
|---|---|
| A01: Broken Access Control | Session-based auth, requireAuth middleware |
| A02: Cryptographic Failures | bcrypt hashing, token hashing, signed cookies |
| A03: Injection | Zod validation, parameterized Mongoose queries |
| A04: Insecure Design | Repository pattern, service layer, config validation |
| A05: Security Misconfiguration | Helmet.js, secure defaults, config validation |
| A07: Auth Failures | Account lockout, session rotation, enumeration protection |
