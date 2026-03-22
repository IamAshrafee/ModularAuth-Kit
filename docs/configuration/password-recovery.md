# Password Recovery Configuration

Enable the forgot/reset password flow.

## Enable

```typescript
createConfig({
  passwordRecovery: {
    enabled: true,
  },
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | boolean | `false` | Mount forgot/reset-password endpoints |
| `identifiedBy` | `'email' \| 'username' \| 'both'` | `'email'` | How users identify themselves |
| `tokenExpiryMinutes` | number | `15` | Reset token lifetime |

## How It Works

1. User calls `POST /auth/forgot-password` with their email
2. Server generates a 256-bit token, stores a SHA-256 hash, and emails the raw token
3. User calls `POST /auth/reset-password` with the token and new password
4. Server verifies the token, hashes the new password, revokes all sessions

## Security

- Tokens are stored as SHA-256 hashes (raw token is never in the database)
- Single-use enforcement: tokens are marked as used after verification
- Old tokens are invalidated when a new one is requested
- `POST /auth/forgot-password` always returns 200, even for nonexistent emails (enumeration protection)
- Token expiry: 15 minutes by default, configurable

## Email Adapter

Set `email.adapter` to control how emails are sent:

| Adapter | When to Use |
|---|---|
| `'console'` (default) | Development — logs email to terminal |
| `'nodemailer'` | Production — sends via SMTP |
