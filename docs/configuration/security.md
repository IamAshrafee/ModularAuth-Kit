# Security Configuration

## Account Lockout

Temporarily lock accounts after too many failed login attempts.

### Enable

```typescript
createConfig({
  security: {
    accountLockout: {
      enabled: true,
      maxFailedAttempts: 5,
      lockDurationMinutes: 15,
    },
  },
});
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | boolean | `false` | Enable account lockout |
| `maxFailedAttempts` | number | `5` | Failed attempts before locking |
| `lockDurationMinutes` | number | `15` | How long the account stays locked |

### How It Works

1. User enters wrong password → `failedLoginAttempts` incremented
2. After N failed attempts → account locked for the configured duration
3. During lockout → all login attempts return `423 ACCOUNT_LOCKED`
4. After lockout expires → next login attempt resets the counter
5. Successful login → `failedLoginAttempts` reset to 0

### Error Response (during lockout)

```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to too many failed attempts. Please try again later",
    "details": []
  }
}
```

### Security Notes

- The lockout is **time-based** — accounts automatically unlock after the duration
- Failed attempt counter resets on successful login
- Lockout status is checked **before** password comparison (no timing leak)
- The error message is generic to avoid confirming account existence

---

## Rate Limiting

Per-endpoint rate limiting protects against brute-force attacks.

### Defaults

| Endpoint | Config Key | Window | Max Attempts |
|---|---|---|---|
| Login | `rateLimiting.login` | 15 minutes | 10 |
| Register | `rateLimiting.register` | 1 hour | 5 |
| Forgot Password | `rateLimiting.forgotPassword` | 15 minutes | 3 |
| Change Password | `rateLimiting.changePassword` | 15 minutes | 5 |

### Customize

```typescript
createConfig({
  security: {
    rateLimiting: {
      login: { windowMs: 900_000, maxAttempts: 10 },
      register: { windowMs: 3_600_000, maxAttempts: 5 },
      forgotPassword: { windowMs: 900_000, maxAttempts: 3 },
      changePassword: { windowMs: 900_000, maxAttempts: 5 },
    },
  },
});
```

### How It Works

- Uses `express-rate-limit` with per-IP tracking
- Returns `429 RATE_LIMITED` with `Retry-After` header when limit is exceeded
- Rate limit counters are **in-memory** — they reset on server restart
- Standard headers are included (`RateLimit-*`) for client consumption
