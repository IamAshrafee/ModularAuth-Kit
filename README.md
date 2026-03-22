# ModularAuth-Kit

> Drop-in authentication module for Express.js + MongoDB + TypeScript.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://mongoosejs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

| Feature | Description |
|---|---|
| 🔐 **Email/Password Auth** | Register, login, logout with argon2id hashing |
| 📱 **Session Management** | Server-side sessions, device listing, remote revocation |
| 🔑 **Password Recovery** | Forgot password + reset with secure tokens |
| ✉️ **Email Verification** | OTP-based email verification |
| 🌐 **Google OAuth 2.0** | PKCE flow, account linking, no Passport.js |
| 📊 **Login History** | Track login events with device/IP metadata |
| 🔒 **Account Lockout** | Temporary lock after failed attempts |
| 📝 **Audit Logging** | Structured JSON logs for all auth events |
| 🛡️ **OWASP Compliant** | Helmet, CSRF, enumeration protection, rate limiting |

## 🤖 AI-Assisted Integration

**Copy the `src/auth/` folder into your project, paste a single prompt to your AI coding agent, and it handles everything.**

The AI agent will:
1. Ask which features you need
2. Collect your config (MongoDB URI, OAuth keys, etc.)
3. Install dependencies, create `.env`, wire into your Express app
4. Verify everything works

👉 **[Get the AI prompt →](docs/ai-integration/agent-prompt.md)**

## Quick Start

### 1. Install

```bash
npm install
cp .env.example .env
```

### 2. Configure

```typescript
import { createConfig, createAuthModule } from './auth';

const config = createConfig({
  session: { secure: false },           // false for HTTP dev
  passwordRecovery: { enabled: true },
  emailVerification: { enabled: true },
  loginHistory: { enabled: true },
  sessionManagement: { enabled: true },
  security: {
    accountLockout: { enabled: true },
  },
});
```

### 3. Mount

```typescript
import express from 'express';
import { createAuthModule } from './auth';

const app = express();
app.use(express.json());
app.use('/auth', createAuthModule(config));
app.listen(3000);
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login |
| POST | `/auth/logout` | ✅ | Logout |
| POST | `/auth/logout-all` | ✅ | Logout all devices |
| GET | `/auth/me` | ✅ | Get profile |
| PATCH | `/auth/me` | ✅ | Update profile |
| POST | `/auth/change-password` | ✅ | Change password |
| POST | `/auth/forgot-password` | ❌ | Request reset token |
| POST | `/auth/reset-password` | ❌ | Reset with token |
| POST | `/auth/verify-email` | ✅ | Verify email OTP |
| POST | `/auth/resend-verification` | ✅ | Resend OTP |
| GET | `/auth/google` | ❌ | Google OAuth redirect |
| GET | `/auth/google/callback` | ❌ | OAuth callback |
| GET | `/auth/login-history` | ✅ | Login history |
| GET | `/auth/sessions` | ✅ | List sessions |
| DELETE | `/auth/sessions/:id` | ✅ | Revoke session |

## Configuration

All features are **disabled by default** — enable only what you need:

```typescript
createConfig({
  login: {
    identifiers: ['email', 'username'],
    allowGoogleOAuth: true,
  },
  passwordRecovery: { enabled: true },
  emailVerification: { enabled: true },
  loginHistory: { enabled: true },
  sessionManagement: { enabled: true },
  security: {
    accountLockout: {
      enabled: true,
      maxFailedAttempts: 5,
      lockDurationMinutes: 15,
    },
  },
});
```

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Database:** MongoDB via Mongoose 9.x
- **Language:** TypeScript 5.x
- **Validation:** Zod 3.x
- **Security:** Helmet, argon2, cookie-parser

## Documentation

Full documentation lives in [`docs/`](docs/README.md):

- [Getting Started](docs/getting-started/quick-start.md)
- [Configuration](docs/configuration/overview.md)
- [API Reference](docs/api/overview.md)
- [Use Case Scenarios](docs/use-cases/README.md)
- [AI Integration Guide](docs/ai-integration/README.md)
- [Security](docs/security/overview.md)
- [FAQ](docs/FAQ.md)

## Project Structure

```
src/auth/
├── index.ts            ← Entry point (createAuthModule)
├── services/           ← Business logic
├── http/controllers/   ← Request handlers
├── http/middleware/     ← Auth, validation, rate limiting
├── http/routes/        ← Route mounting
├── repositories/       ← Database access (swappable)
├── models/             ← Mongoose schemas
├── adapters/           ← Email, database adapters
└── utils/              ← Crypto, audit logger, device parser
```

## License

MIT
