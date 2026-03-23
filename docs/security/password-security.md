# Password Security

## Hashing

- **Algorithm:** argon2id (OWASP recommended)
- **Parameters:** Memory 19 MiB, Iterations 2, Parallelism 1
- **Hash length:** 32 bytes
- **Hashing time:** ~300ms per password

argon2id is the most secure password hashing algorithm available, resistant to both side-channel and GPU-based attacks.

## Storage

- Passwords are **never stored in plaintext**
- The `passwordHash` field is **never included** in API responses
- User queries use a separate `findByEmailWithPassword()` method that explicitly selects the hash

## Validation

Configurable password policy:

| Rule | Default |
|---|---|
| Minimum length | 8 |
| Maximum length | 128 |
| Require uppercase | Yes |
| Require lowercase | Yes |
| Require number | Yes |
| Require special character | No |

## Password Change

When a user changes their password:
1. OAuth-only users (no password set) are blocked with a clear error
2. Old password is verified first
3. New password is checked against the old one — **same-password reuse is rejected**
4. New password is validated against the configured policy
5. New password is hashed with argon2id
6. **All other sessions are revoked** — the current session stays active
7. Login history records the event (if enabled)

## Password Reset

When a user resets via forgot-password:
1. A cryptographically random token is generated
2. Token is stored hashed (SHA-256) in the database
3. Token expires after 15 minutes (configurable)
4. On reset: token is verified, new password is checked against the old one (same-password reuse rejected)
5. Password is updated, **all sessions revoked**
6. Token is single-use (marked as used after verification)
