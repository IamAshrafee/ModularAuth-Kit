# Login History Configuration

Track and query user login events.

## Enable

```typescript
createConfig({
  loginHistory: {
    enabled: true,
  },
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | boolean | `false` | Enable login event recording |
| `retentionDays` | number | `90` | Days to retain history entries |

## What Gets Recorded

Login history is automatically recorded for:
- **Login success** — successful email/password login
- **Login failure** — wrong password attempt
- **Password change** — via change-password endpoint
- **Logout** — user-initiated logout

Each entry includes: IP address, user-agent, parsed device info, timestamp, success status.

## Cleanup

Use `LoginHistoryService.cleanup(retentionDays)` to delete old entries. This can be called from a scheduled job (e.g., cron).
