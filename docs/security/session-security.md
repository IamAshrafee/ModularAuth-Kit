# Session Security

## Cookie Configuration

| Attribute | Value | Purpose |
|---|---|---|
| `httpOnly` | `true` | Prevents JavaScript access (XSS protection) |
| `secure` | `true` (prod) | Cookie sent only over HTTPS |
| `sameSite` | `lax` | CSRF protection |
| `signed` | `true` | Tamper detection via HMAC |
| `path` | `/` | Available site-wide |

## Session Storage

- Sessions are stored **server-side** in MongoDB
- The cookie contains only the session ID (no user data)
- Session IDs are 256-bit cryptographically random hex strings

## Session Lifecycle

1. **Creation:** On register/login, a new session is inserted in MongoDB
2. **Validation:** On each request, session is loaded, expiry and idle timeout checked
3. **Touch:** `lastActiveAt` is updated on each valid request
4. **Rotation:** On login, the session ID is rotated (OWASP Session Fixation prevention)
5. **Expiry:** Absolute expiry (7 days) and idle timeout (24 hours)
6. **Revocation:** On logout, session is deleted from the database

## Protection Measures

- **Session fixation:** Session ID is rotated after login
- **Session hijacking:** httpOnly + secure + signed cookies
- **CSRF:** SameSite=lax + optional double-submit cookie
- **Brute force:** Session IDs have 256-bit entropy (infeasible to guess)
- **Idle timeout:** Sessions expire after inactivity
