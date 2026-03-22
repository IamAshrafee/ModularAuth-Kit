# Session Configuration

Configure cookie-based server-side sessions.

## Options

```typescript
createConfig({
  session: {
    cookieName: 'sid',
    secret: '',              // Set via SESSION_SECRET env var
    maxAge: 604800000,       // 7 days (ms)
    idleTimeout: 86400000,   // 24 hours (ms)
    rotateOnLogin: true,
    secure: true,
    sameSite: 'lax',
  },
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `cookieName` | string | `'sid'` | Session cookie name |
| `secret` | string | `''` | Cookie signing secret (use env var) |
| `maxAge` | number | `604800000` | Absolute session lifetime (7 days) |
| `idleTimeout` | number | `86400000` | Inactivity timeout (24 hours) |
| `rotateOnLogin` | boolean | `true` | Rotate session ID on login (OWASP) |
| `secure` | boolean | `true` | Set `Secure` flag (HTTPS only) |
| `sameSite` | string | `'lax'` | SameSite cookie attribute |

## Development

Set `secure: false` for HTTP development:

```typescript
createConfig({
  session: { secure: false },
});
```

## Session Lifecycle

1. **Created** on register/login — stored in MongoDB, ID sent as httpOnly cookie
2. **Validated** on each request — checks expiry and idle timeout
3. **Touched** on each request — resets idle timeout
4. **Rotated** on login — prevents session fixation
5. **Revoked** on logout — deleted from database
