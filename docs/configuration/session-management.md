# Session Management Configuration

Allow users to view and revoke their active sessions/devices.

## Enable

```typescript
createConfig({
  sessionManagement: {
    enabled: true,
  },
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | boolean | `false` | Enable session listing and revocation endpoints |
| `maxActiveSessions` | number | `5` | Maximum concurrent sessions per user |

## How It Works

- `GET /auth/sessions` — Returns all active sessions with device info, IP, timestamps, and `isCurrent` flag
- `DELETE /auth/sessions/:id` — Revoke a specific session (cannot revoke current — use `/logout`)

## Max Sessions

When `maxActiveSessions` is set, new logins will delete the oldest session if the limit is reached. This is enforced automatically during login.
