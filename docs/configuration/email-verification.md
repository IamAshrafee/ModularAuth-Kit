# Email Verification Configuration

Require users to verify their email address.

## Enable

```typescript
createConfig({
  emailVerification: {
    enabled: true,
  },
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | boolean | `false` | Send verification code on registration |
| `requiredToLogin` | boolean | `false` | Block login until email is verified |
| `codeLength` | number | `6` | OTP code length (digits) |
| `codeExpiryMinutes` | number | `10` | Code expiry time |

## How It Works

1. User registers → server sends a 6-digit OTP to their email
2. User calls `POST /auth/verify-email` with the code
3. Server verifies code → sets `isEmailVerified = true`

## `requiredToLogin` Mode

When `requiredToLogin: true`:
- Users can register and receive a session
- Users can call `POST /auth/verify-email` with that session
- On subsequent logins, unverified users get `403 EMAIL_NOT_VERIFIED`

```typescript
createConfig({
  emailVerification: {
    enabled: true,
    requiredToLogin: true,
  },
});
```

## Email Adapter

In development, the OTP code appears in the server console via the `console` adapter. In production, set `email.adapter: 'nodemailer'` to send real emails.
