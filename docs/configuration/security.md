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
