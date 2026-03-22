# Frequently Asked Questions

## General

### What is ModularAuth-Kit?

ModularAuth-Kit is a **drop-in authentication module** for Express.js + MongoDB + TypeScript projects. Copy the `src/auth/` folder into your project, call `createAuthModule(config)`, and you get a fully functional auth system with 16 endpoints.

### Do I need to use all features?

No. **All optional features are disabled by default.** You start with just register, login, logout, profile, and change-password. Enable features one by one as you need them.

### What's the minimum setup?

Five lines of config and you get 7 endpoints:

```typescript
const config = createConfig({
  session: { secure: false }, // false for HTTP dev
});
app.use('/auth', createAuthModule(config));
```

### Can I use this with an AI coding agent?

Yes! We provide a ready-made prompt that AI agents can follow to integrate ModularAuth-Kit into your project automatically. See [AI-Assisted Integration](ai-integration/agent-prompt.md).

---

## Setup & Configuration

### Why does the server crash on startup with "Missing required: SESSION_SECRET"?

You haven't set the `SESSION_SECRET` environment variable. Create a `.env` file:

```bash
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### How do I disable HTTPS for local development?

Set `session.secure` to `false`:

```typescript
createConfig({
  session: { secure: false },
});
```

In production, always set `secure: true` and use HTTPS.

### I get "Google OAuth is enabled but GOOGLE_CLIENT_ID is missing"

You enabled OAuth (`login.allowGoogleOAuth: true`) but haven't set the Google credentials. Either:
- Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` to `.env`
- Or disable OAuth: `login: { allowGoogleOAuth: false }`

### How do I change the auth route path from `/auth` to `/api/auth`?

Change the mount path in your Express app:

```typescript
// Default
app.use('/auth', createAuthModule(config));

// Custom
app.use('/api/v1/auth', createAuthModule(config));
```

### What's the default session duration?

| Setting | Default | Description |
|---|---|---|
| `maxAge` | 7 days | Absolute session lifetime |
| `idleTimeout` | 30 minutes | Expires after inactivity |

Sessions expire at whichever comes first.

---

## Authentication

### Why do "user not found" and "wrong password" give the same error message?

**This is intentional security.** If an attacker tries to log in with `victim@example.com`, different error messages would reveal whether that email is registered. By using the same message (`"The email or password you entered is incorrect"`), we prevent email enumeration attacks.

### Can users log in with username instead of email?

Yes. Enable username in registration and add it to login identifiers:

```typescript
createConfig({
  registration: {
    fields: { username: { enabled: true, required: true } },
  },
  login: {
    identifiers: ['email', 'username'], // Accept either
  },
});
```

### What happens when a user changes their password?

1. Current password is verified
2. New password is hashed with argon2id
3. **All sessions are revoked** (forces re-login on all devices)
4. The event is logged in login history (if enabled)

### What are the default password requirements?

| Rule | Default |
|---|---|
| Min length | 8 characters |
| Max length | 128 characters |
| Uppercase required | Yes |
| Lowercase required | Yes |
| Number required | Yes |
| Special character | No |

Customizable via `registration.validation.password`.

### How does account lockout work?

After N failed login attempts (default 5), the account is temporarily locked for M minutes (default 15). During lockout:
- Login returns HTTP 423 with `ACCOUNT_LOCKED`
- The lockout auto-expires — no admin action needed
- Successful login resets the failure counter

---

## Sessions & Cookies

### Where are sessions stored?

Sessions are stored **server-side in MongoDB** (in the `sessions` collection). The browser only receives an httpOnly cookie containing the session ID — no user data is stored in the cookie.

### Can a user be logged in on multiple devices?

Yes. Each login creates a new session. The default limit is 5 concurrent sessions per user. When the limit is exceeded, the oldest session is automatically revoked.

### How do I revoke a specific session?

If session management is enabled:

```bash
# List all sessions
GET /auth/sessions

# Revoke a specific session (by its ID)
DELETE /auth/sessions/:sessionId
```

Users can only revoke their own sessions. They cannot revoke their current session (use `/auth/logout` instead).

### Why can't I access protected routes after restarting the server?

When the server restarts, it reconnects to MongoDB. Your sessions are still in the database and should work. If they don't:
- Check that your cookie jar still has the `sid` cookie
- Check that `SESSION_SECRET` hasn't changed (changing it invalidates all signed cookies)

---

## Security

### What hashing algorithm does ModularAuth-Kit use?

**argon2id** — the algorithm recommended by OWASP for password hashing. It's memory-hard (resistant to GPU attacks) and provides side-channel resistance.

Parameters: Memory 19 MiB, Iterations 2, Parallelism 1, Hash length 32 bytes.

### Are password reset tokens stored in plaintext?

No. Tokens are **hashed with SHA-256** before storage. The raw token is sent to the user via email; only the hash exists in the database. A database breach won't expose valid tokens.

### How does CSRF protection work?

ModularAuth-Kit uses the **double-submit cookie** pattern. A CSRF token is set in a cookie and must be included in request headers. Combined with `SameSite=lax` cookies, this prevents cross-site request forgery.

### Is rate limiting built-in?

Yes. Rate limits are applied per-endpoint:

| Endpoint | Window | Max Attempts |
|---|---|---|
| Login | 15 minutes | 10 |
| Register | 1 hour | 5 |
| Forgot Password | 15 minutes | 3 |

---

## Email & Verification

### Do I need an email provider for development?

No. The default email adapter is `console`, which prints emails to your terminal. Use this for development:

```typescript
createConfig({
  email: { adapter: 'console' }, // Default — prints to terminal
});
```

For production, switch to `nodemailer` with SMTP credentials.

### How does email verification work?

1. User registers → 6-digit OTP is sent to their email
2. User calls `POST /auth/verify-email` with the OTP
3. If `requiredToLogin` is `true`, unverified users can't access protected routes

### What if a user doesn't receive the verification email?

They can request a new one:

```bash
POST /auth/resend-verification
```

The old OTP is invalidated and a new one is sent.

---

## Google OAuth

### Do I need Passport.js?

No. ModularAuth-Kit implements Google OAuth 2.0 directly using HTTP requests with PKCE. No Passport.js dependency.

### What happens if a user signs up with Google and later tries email login?

If they registered via Google OAuth, they won't have a password set. They'll need to use the forgot-password flow to set one, or continue using Google login.

### What if a Google user's email matches an existing email account?

The accounts are **linked automatically**. The Google ID is attached to the existing user, and they can log in with either method.

---

## Customization

### Can I add custom fields to the user model?

Yes. See [Adding Custom Fields](guides/adding-custom-fields.md). You'll need to:
1. Update the Mongoose schema
2. Update the TypeScript types
3. Update the Zod validation schema

### Can I use PostgreSQL instead of MongoDB?

Not out of the box, but the **repository pattern** makes it possible. Implement the repository interfaces (`IUserRepository`, `ISessionRepository`, etc.) with your PostgreSQL queries. See [Custom Database](guides/custom-database.md).

### Can I use SendGrid instead of Nodemailer?

Yes. Implement the `IEmailAdapter` interface with your SendGrid client. See [Custom Email Provider](guides/custom-email-provider.md).

### How do I add middleware to auth routes?

See [Extending Middleware](guides/extending-middleware.md). You can add middleware before the auth router mount:

```typescript
app.use('/auth', customMiddleware, createAuthModule(config));
```

---

## Troubleshooting

### "Cannot find module './auth/index.js'"

Your TypeScript is not compiling with ESM module resolution. Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

### "ValidationError: Path 'userAgent' is required"

This happens if a login history event is being recorded without proper request metadata. Ensure you're passing the request's `User-Agent` header to service methods. This was a known issue fixed in Phase 19.

### Cookies aren't being sent in requests

Check:
1. You're using `-c cookies.txt` AND `-b cookies.txt` with curl
2. If using a frontend: credentials mode is `include` in fetch/axios
3. If cross-origin: `SameSite` must be `none` and `secure` must be `true`

### "Too many requests" error

You've hit the rate limit. Wait for the rate limit window to expire:
- Login: 15 minutes
- Register: 1 hour
- Forgot password: 15 minutes

For development, you can restart the server to reset in-memory rate limit counters.
