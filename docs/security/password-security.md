# Password Security

## Hashing

- **Algorithm:** bcrypt
- **Cost factor:** 12 (configurable)
- **Salt:** Automatically generated per password

bcrypt is designed to be slow, making brute-force attacks impractical.

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
2. New password is hashed with bcrypt
3. **All existing sessions are revoked** (forces re-login everywhere)
4. A new session is created for the current device
5. Login history records the event

## Password Reset

When a user resets via forgot-password:
1. A cryptographically random token is generated
2. Token is stored hashed (SHA-256) in the database
3. Token expires after the configured duration
4. On reset: token is verified, password updated, **all sessions revoked**
5. Token is single-use (deleted after use)
