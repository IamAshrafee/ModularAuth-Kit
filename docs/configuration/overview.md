# Configuration Overview

ModularAuth-Kit uses a **defaults + overrides** configuration system. All features are disabled by default for security.

## How It Works

```typescript
import { createConfig } from './auth';

const config = createConfig({
  // Your overrides — only specify what you want to change
  session: { secure: false },
  passwordRecovery: { enabled: true },
});
```

`createConfig()` deep-merges your overrides with secure defaults. Any property you don't specify keeps its default value.

## Feature Switches

| Feature | Config Key | Default |
|---|---|---|
| Password Recovery | `passwordRecovery.enabled` | `false` |
| Email Verification | `emailVerification.enabled` | `false` |
| Google OAuth | `login.allowGoogleOAuth` | `false` |
| Login History | `loginHistory.enabled` | `false` |
| Session Management | `sessionManagement.enabled` | `false` |
| Account Lockout | `security.accountLockout.enabled` | `false` |

When a feature is disabled, its routes are **not mounted** and no related code runs.

## Environment Variables

Config values are populated from environment variables when available:

| Env Var | Maps To |
|---|---|
| `SESSION_SECRET` | `session.secret` |
| `GOOGLE_CLIENT_ID` | `google.clientId` |
| `GOOGLE_CLIENT_SECRET` | `google.clientSecret` |
| `GOOGLE_CALLBACK_URL` | `google.callbackUrl` |

## Config Sections

| Section | Docs |
|---|---|
| Registration | [registration.md](registration.md) |
| Login | [login.md](login.md) |
| Sessions | [sessions.md](sessions.md) |
| Security | [security.md](security.md) |
| Password Recovery | [password-recovery.md](password-recovery.md) |
| Email Verification | [email-verification.md](email-verification.md) |
| Google OAuth | [google-oauth.md](google-oauth.md) |
| Login History | [login-history.md](login-history.md) |
| Session Management | [session-management.md](session-management.md) |
