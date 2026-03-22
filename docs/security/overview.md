# Security Overview

ModularAuth-Kit implements multiple layers of defense following OWASP best practices.

## Security Layers

| Layer | Implementation |
|---|---|
| **Password Hashing** | argon2id with OWASP-recommended parameters |
| **Session Management** | Server-side sessions, httpOnly cookies, ID rotation |
| **CSRF Protection** | Double-submit cookie pattern |
| **Account Lockout** | Temporary lock after N failed attempts |
| **Rate Limiting** | Per-endpoint rate limits |
| **Input Validation** | Zod schemas on all endpoints |
| **Security Headers** | Helmet.js with secure defaults |
| **Enumeration Protection** | Identical error messages for user-not-found vs wrong-password |
| **Token Security** | Cryptographically random tokens, expiry, single-use |
| **Audit Logging** | Structured JSON logs for all auth events |

## Detailed Docs

- [Password Security](password-security.md) — Hashing and storage
- [Session Security](session-security.md) — Cookie and session management
- [Token Security](token-security.md) — Reset and verification tokens
- [Best Practices](best-practices.md) — Production security checklist
