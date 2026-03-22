# Login Configuration

Configure login identifiers and OAuth options.

## Identifiers

```typescript
createConfig({
  login: {
    identifiers: ['email'],        // or ['email', 'username']
    allowGoogleOAuth: false,
  },
});
```

| Option | Type | Default | Description |
|---|---|---|---|
| `identifiers` | string[] | `['email']` | Fields users can log in with |
| `allowGoogleOAuth` | boolean | `false` | Enable Google OAuth 2.0 login |

## Identifier Options

- `['email']` — Login with email only (default)
- `['email', 'username']` — Login with email or username (requires `username` field enabled)

## Google OAuth

When `allowGoogleOAuth: true`, two additional routes are mounted:
- `GET /auth/google` — Redirect to Google
- `GET /auth/google/callback` — Handle Google's redirect

See [Google OAuth Configuration](google-oauth.md) for credential setup.
