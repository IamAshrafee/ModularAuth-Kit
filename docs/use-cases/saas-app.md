# Use Case: SaaS Application

Full-featured auth for a SaaS product with Google OAuth, email verification, and session management.

## Your Project Structure

```
saas-api/
├── src/
│   ├── auth/              ← ModularAuth-Kit
│   ├── workspaces/
│   │   ├── workspace.model.ts
│   │   └── workspace.routes.ts
│   ├── billing/
│   │   └── billing.routes.ts
│   ├── teams/
│   │   └── team.routes.ts
│   ├── app.ts
│   └── server.ts
├── .env
└── package.json
```

## Configuration

SaaS needs everything: OAuth, email verification, session management, history, lockout.

```typescript
// src/server.ts
const config = createConfig({
  session: {
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30-day sessions
  },
  registration: {
    fields: {
      fullName: { enabled: true, required: true },
      username: { enabled: true, required: false },
    },
  },
  login: {
    identifiers: ['email', 'username'],
    allowGoogleOAuth: true,
  },
  passwordRecovery: { enabled: true },
  emailVerification: {
    enabled: true,
    requiredForLogin: true, // Must verify before using the app
  },
  loginHistory: { enabled: true },
  sessionManagement: { enabled: true },
  security: {
    accountLockout: {
      enabled: true,
      maxFailedAttempts: 5,
      lockDurationMinutes: 15,
    },
  },
  email: { adapter: 'nodemailer' },
});

app.use('/auth', createAuthModule(config));
```

## Environment Variables

Add these to your **existing** `.env` (only `SESSION_SECRET` is new — the rest are for Google/email):

```bash
SESSION_SECRET=<64-char-random-string>
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_CALLBACK_URL=https://myapp.com/auth/google/callback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@myapp.com
SMTP_PASS=app-password
EMAIL_FROM=noreply@myapp.com
```

> 💡 Your existing `MONGODB_URI` is reused automatically — the auth module uses your active Mongoose connection.

## User Flows

### Flow 1: Email Registration → Verify → Use App

```bash
# Register
curl -X POST https://myapp.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@company.com","password":"Secure1234!","fullName":"John Doe"}' \
  -c cookies.txt
# → Email with OTP sent

# Verify email (OTP from email)
curl -X POST https://myapp.com/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456"}' \
  -b cookies.txt

# Now access the app
curl https://myapp.com/api/workspaces -b cookies.txt
```

### Flow 2: Google OAuth (one click)

```bash
# Redirect user to:
GET https://myapp.com/auth/google
# → Redirects to Google → callback → auto-creates account → logged in
```

### Flow 3: Session Management

```bash
# User checks active sessions (logged in from phone + laptop)
curl https://myapp.com/auth/sessions -b cookies.txt
# → Shows 2 sessions with device info

# Revoke phone session
curl -X DELETE https://myapp.com/auth/sessions/<session-id> -b cookies.txt
```

### Flow 4: Security Monitoring

```bash
# Check login history
curl "https://myapp.com/auth/login-history?page=1&limit=10" -b cookies.txt
# → Shows recent logins with IP, device, success/failure
```

## All Endpoints Available

| Endpoint | Description |
|---|---|
| `POST /auth/register` | Create account with name |
| `POST /auth/login` | Login with email or username |
| `GET /auth/google` | Google OAuth login |
| `POST /auth/verify-email` | Verify email with OTP |
| `POST /auth/resend-verification` | Resend OTP |
| `POST /auth/forgot-password` | Password reset |
| `POST /auth/reset-password` | Reset with token |
| `GET /auth/sessions` | List active sessions |
| `DELETE /auth/sessions/:id` | Revoke a session |
| `GET /auth/login-history` | Login event history |
| `POST /auth/logout` | Logout current session |
| `POST /auth/logout-all` | Logout all devices |
