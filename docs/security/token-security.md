# Token Security

## Token Types

| Token | Purpose | Expiry |
|---|---|---|
| Password Reset | Forgot-password flow | Configurable (default 1 hour) |
| Email Verification | OTP for email verification | Configurable (default 10 minutes) |

## Generation

- Tokens are generated using `crypto.randomBytes(32)` — 256-bit entropy
- OTP codes use `crypto.randomInt()` for 6-digit numeric codes

## Storage

- Tokens are **hashed** (SHA-256) before storage in the database
- The raw token is sent to the user; only the hash is persisted
- This ensures that a database breach does not expose valid tokens

## Validation

1. The raw token from the user is hashed
2. The hash is looked up in the database
3. Expiry is checked
4. If valid, the token is **deleted** (single-use)

## Security Properties

- **Single-use:** Tokens are deleted after use
- **Expiry:** Tokens automatically expire
- **Hashed storage:** Database leak doesn't expose tokens
- **High entropy:** 256-bit randomness prevents guessing
- **Rate limited:** Token generation endpoints are rate-limited
