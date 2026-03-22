# ModularAuth-Kit — Technical Context for AI Agents

> This file provides the technical context an AI agent needs to understand
> how ModularAuth-Kit works, so it can properly integrate it into any project.

## What This Module Is

ModularAuth-Kit is a **self-contained authentication module** for Express.js + MongoDB + TypeScript. The entire module lives inside the `src/auth/` folder. It provides:

- Email/password registration and login
- Server-side session management with httpOnly cookies
- Password recovery (forgot/reset)
- Email verification (OTP)
- Google OAuth 2.0
- Login history tracking
- Session listing and device revocation
- Account lockout
- Audit logging

## Entry Point

```typescript
import { createAuthModule, createConfig } from './auth/index.js';
```

- `createConfig(overrides?)` — Merges user overrides with secure defaults
- `createAuthModule(config)` — Returns an Express Router with all routes

## Feature Switches

All features are **disabled by default**. Enable via config:

| Feature | Config Key | Default |
|---|---|---|
| Password Recovery | `passwordRecovery.enabled` | `false` |
| Email Verification | `emailVerification.enabled` | `false` |
| Google OAuth | `login.allowGoogleOAuth` | `false` |
| Login History | `loginHistory.enabled` | `false` |
| Session Management | `sessionManagement.enabled` | `false` |
| Account Lockout | `security.accountLockout.enabled` | `false` |
| Username Field | `registration.fields.username.enabled` | `false` |

When disabled, routes are not mounted and no related code runs.

## Required Environment Variables

**Always required:**
- `MONGODB_URI` — MongoDB connection string
- `SESSION_SECRET` — 64+ char random string for cookie signing

**Conditionally required:**
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — when Google OAuth enabled
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` — when Nodemailer email adapter used

## Dependencies

```json
{
  "argon2": "^0.44.x",
  "cookie-parser": "^1.x",
  "dotenv": "^16.x",
  "express": "^4.x",
  "helmet": "^8.x",
  "mongoose": "^8.x",
  "zod": "^3.x"
}
```

Optional: `nodemailer` (only if using Nodemailer email adapter)

## API Endpoints

### Always Available
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login |
| POST | `/logout` | Yes | Logout current session |
| POST | `/logout-all` | Yes | Logout all sessions |
| GET | `/me` | Yes | Get profile |
| PATCH | `/me` | Yes | Update profile |
| POST | `/change-password` | Yes | Change password |

### When Password Recovery Enabled
| POST | `/forgot-password` | No | Request reset token |
| POST | `/reset-password` | No | Reset with token |

### When Email Verification Enabled
| POST | `/verify-email` | Yes | Verify with OTP |
| POST | `/resend-verification` | Yes | Resend OTP |

### When Google OAuth Enabled
| GET | `/google` | No | Redirect to Google |
| GET | `/google/callback` | No | Handle callback |

### When Login History Enabled
| GET | `/login-history` | Yes | Paginated history |

### When Session Management Enabled
| GET | `/sessions` | Yes | List active sessions |
| DELETE | `/sessions/:id` | Yes | Revoke a session |

## Integration Pattern

```typescript
// 1. Connect to MongoDB
await connectDatabase(process.env.MONGODB_URI!);

// 2. Create Express app
const app = express();
app.use(express.json());

// 3. Create config
const config = createConfig({ /* overrides */ });

// 4. Mount auth
app.use('/auth', createAuthModule(config));

// 5. Protect custom routes
import { requireAuth } from './auth/http/middleware/require-auth.js';
app.get('/api/protected', requireAuth, handler);
```

## File Structure

```
src/auth/
├── index.ts                    ← Entry point
├── auth.config.ts              ← Config factory
├── auth.constants.ts           ← Error codes, messages
├── auth.types.ts               ← TypeScript types
├── services/                   ← Business logic
├── http/controllers/           ← Request handlers
├── http/middleware/             ← Auth, validation, security
├── http/routes/                ← Route mounting
├── http/schemas/               ← Zod validation
├── repositories/interfaces/    ← DB contracts
├── repositories/mongodb/       ← MongoDB implementations
├── models/                     ← Mongoose schemas
├── adapters/                   ← Email, database adapters
├── errors/                     ← Error classes
└── utils/                      ← Crypto, audit, device parser
```

## Security Rules

1. `passwordHash` is never included in API responses
2. Login errors use identical messages (enumeration protection)
3. Sessions use httpOnly, signed, SameSite cookies
4. Tokens are hashed (SHA-256) before database storage
5. argon2id with OWASP-recommended parameters for password hashing
6. Session IDs are rotated after login (fixation prevention)
