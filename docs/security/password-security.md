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
1. Old password is verified first
2. New password is hashed with argon2id
3. **All existing sessions are revoked** (forces re-login everywhere)
4. A new session is created for the current device
5. Login history records the event

## Password Reset

When a user resets via forgot-password:
1. A cryptographically random token is generated
2. Token is stored hashed (SHA-256) in the database
3. Token expires after 15 minutes (configurable)
4. On reset: token is verified, password updated, **all sessions revoked**
5. Token is single-use (deleted after use)
