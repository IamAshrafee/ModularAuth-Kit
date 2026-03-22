# Environment Variables

All environment variables used by ModularAuth-Kit.

---

## Required

| Variable | Type | Default | Description |
|---|---|---|---|
| `SESSION_SECRET` | string | — | Session signing secret. Min 32 characters. |
| `MONGODB_URI` | string | `mongodb://localhost:27017/modularauth` | MongoDB connection string |

## Server

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | number | `3000` | HTTP server port |
| `NODE_ENV` | string | `development` | `development` or `production` |

## Google OAuth (optional)

Required only if `login.allowGoogleOAuth` is `true`.

| Variable | Type | Default | Description |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | string | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | string | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | string | — | OAuth callback URL |

## SMTP Email (optional)

Required only if `email.adapter` is `'nodemailer'`.

| Variable | Type | Default | Description |
|---|---|---|---|
| `SMTP_HOST` | string | — | SMTP server hostname |
| `SMTP_PORT` | number | `587` | SMTP server port |
| `SMTP_USER` | string | — | SMTP username |
| `SMTP_PASS` | string | — | SMTP password |
| `EMAIL_FROM` | string | `noreply@example.com` | Sender email address |

---

## Example `.env`

```env
SESSION_SECRET=my-super-secret-key-at-least-32-characters-long
MONGODB_URI=mongodb://localhost:27017/modularauth
PORT=3000
NODE_ENV=development
```
