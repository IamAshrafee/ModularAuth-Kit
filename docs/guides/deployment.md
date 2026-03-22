# Deployment Guide

Production deployment checklist for ModularAuth-Kit.

## Environment Variables

**Required:**

```bash
MONGODB_URI=mongodb+srv://...          # Production MongoDB
SESSION_SECRET=<64+ random chars>       # openssl rand -hex 32
NODE_ENV=production
```

**Optional (feature-dependent):**

```bash
GOOGLE_CLIENT_ID=...                   # If Google OAuth enabled
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
SMTP_HOST=smtp.gmail.com               # If Nodemailer enabled
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=noreply@yourdomain.com
```

## Configuration

```typescript
const config = createConfig({
  session: {
    secure: true,           // HTTPS only
    sameSite: 'lax',        // CSRF protection
  },
  security: {
    csrfProtection: true,
    accountLockout: {
      enabled: true,
      maxFailedAttempts: 5,
      lockDurationMinutes: 15,
    },
  },
  email: {
    adapter: 'nodemailer',
  },
});
```

## Checklist

- [ ] `SESSION_SECRET` is set and random (not committed to git)
- [ ] `session.secure: true` (HTTPS required)
- [ ] HTTPS enabled via reverse proxy (nginx, Cloudflare, etc.)
- [ ] MongoDB has authentication enabled
- [ ] Rate limiting is configured
- [ ] CSRF protection is enabled
- [ ] Account lockout is enabled
- [ ] `NODE_ENV=production`
- [ ] Error messages don't leak internal details
- [ ] All cookies are httpOnly, secure, sameSite
- [ ] Password hashing uses argon2id with OWASP parameters

## Reverse Proxy

Behind nginx or similar, enable `trust proxy`:

```typescript
app.set('trust proxy', 1); // Trust first proxy
```

This ensures `req.ip` returns the client's real IP, not the proxy's.

## MongoDB

- Use a replica set for availability
- Enable authentication
- Create a dedicated database user with minimal permissions
- Enable TLS for connections
