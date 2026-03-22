# ModularAuth-Kit — AI Agent Integration Prompt

> **Copy this entire file and paste it as a prompt to your AI coding agent.**
> The agent will guide you through integrating authentication into your project.

---

## Your Role

You are integrating **ModularAuth-Kit** — a pre-built authentication module — into the user's existing Express.js + TypeScript project. The `src/auth/` folder has already been copied into their project.

Your job is to:
1. Ask the user questions to understand their needs
2. Install dependencies
3. Configure the auth module
4. Wire it into their existing Express app
5. Create/update the `.env` file
6. Verify everything works

Follow each step below in order. Do not skip steps.

---

## Step 1: Understand the Project

First, scan the user's project to understand their setup:

- Read `package.json` to check existing dependencies
- Read `tsconfig.json` to check TypeScript configuration
- Find their main Express app file (e.g., `app.ts`, `server.ts`, `index.ts`)
- Identify where routes are mounted
- Check if they already have a `.env` file

Then ask the user:

> **I've scanned your project. Before I set up authentication, I need to know a few things:**
>
> 1. **Which features do you need?** (answer yes/no for each)
>    - Password recovery (forgot password / reset password)?
>    - Email verification (OTP verification after registration)?
>    - Google OAuth login (Login with Google)?
>    - Login history tracking?
>    - Session management (list/revoke devices)?
>    - Account lockout (lock after failed attempts)?
>    - Username support (login with username instead of just email)?
>
> 2. **What extra user fields do you need?** (optional)
>    - Full name?
>    - First name / Last name?
>    - Username?
>
> 3. **What path should auth routes be mounted on?**
>    - Default: `/auth` (e.g., `/auth/login`, `/auth/register`)
>    - Or custom: `/api/auth`, `/api/v1/auth`, etc.
>
> 4. **What's your MongoDB connection string?**
>    - Local: `mongodb://localhost:27017/your-db-name`
>    - Atlas: `mongodb+srv://...`

Wait for the user to answer before proceeding.

---

## Step 2: Collect Feature-Specific Info

Based on the user's answers in Step 1, ask follow-up questions ONLY for features they enabled:

### If Google OAuth = Yes:
> I need your Google OAuth credentials:
> - `GOOGLE_CLIENT_ID` — from Google Cloud Console
> - `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
> - `GOOGLE_CALLBACK_URL` — e.g., `http://localhost:3000/auth/google/callback`
>
> (If you don't have these yet, I'll set up placeholder values and you can fill them in later.)

### If Password Recovery or Email Verification = Yes:
> For sending emails, which adapter do you want?
> - **Console** (development) — emails printed to terminal, no setup needed
> - **Nodemailer** (production) — needs SMTP credentials
>
> If Nodemailer: I need `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

### If Account Lockout = Yes:
> Account lockout settings:
> - Max failed attempts before lock? (default: 5)
> - Lock duration in minutes? (default: 15)

Wait for the user to answer before proceeding.

---

## Step 3: Install Dependencies

Run the following command to install required dependencies (skip any already in package.json):

```bash
npm install express mongoose argon2 helmet cookie-parser zod dotenv
npm install -D @types/express @types/cookie-parser
```

If the user enabled Google OAuth, no extra packages are needed (direct HTTP implementation).

If the user chose Nodemailer, also install:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

---

## Step 4: Create/Update .env

Create or update the `.env` file with the collected values:

```bash
# Database
MONGODB_URI=<user's mongodb connection string>

# Session
SESSION_SECRET=<generate a random 64-character hex string>

# Server
PORT=3000
NODE_ENV=development
```

Add feature-specific variables based on user's answers:

```bash
# If Google OAuth enabled:
GOOGLE_CLIENT_ID=<from user>
GOOGLE_CLIENT_SECRET=<from user>
GOOGLE_CALLBACK_URL=<from user>

# If Nodemailer enabled:
SMTP_HOST=<from user>
SMTP_PORT=<from user>
SMTP_USER=<from user>
SMTP_PASS=<from user>
EMAIL_FROM=<from user>
```

Generate the SESSION_SECRET with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 5: Configure and Mount the Auth Module

Modify the user's main Express app file. The integration looks like this:

```typescript
import 'dotenv/config';
import express from 'express';
import { createConfig, createAuthModule } from './auth/index.js';
import { connectDatabase } from './auth/adapters/database/mongodb.adapter.js';

// ... existing imports ...

async function bootstrap() {
  // Connect to MongoDB (add this if not already present)
  await connectDatabase(process.env.MONGODB_URI!);

  const app = express();
  app.use(express.json());

  // Auth configuration
  const authConfig = createConfig({
    session: {
      secure: process.env.NODE_ENV === 'production',
    },
    // ... add feature configs based on user's answers ...
  });

  // Mount auth routes
  app.use('<mount-path>', createAuthModule(authConfig));

  // ... rest of user's existing routes ...

  app.listen(process.env.PORT ?? 3000);
}
```

### Config Builder Reference

Build the config object based on Step 1 answers:

```typescript
const authConfig = createConfig({
  session: {
    secure: process.env.NODE_ENV === 'production',
  },

  // If user wants username support:
  registration: {
    fields: {
      username: { enabled: true, required: true },
      fullName: { enabled: true, required: false },
      // ... other fields based on user's answer
    },
  },

  // If user wants username login:
  login: {
    identifiers: ['email', 'username'],
    allowGoogleOAuth: false, // true if Google OAuth enabled
  },

  // If password recovery enabled:
  passwordRecovery: { enabled: true },

  // If email verification enabled:
  emailVerification: {
    enabled: true,
    requiredForLogin: false, // ask user if they want this
  },

  // If login history enabled:
  loginHistory: { enabled: true },

  // If session management enabled:
  sessionManagement: { enabled: true },

  // Security settings:
  security: {
    csrfProtection: process.env.NODE_ENV === 'production',
    // If account lockout enabled:
    accountLockout: {
      enabled: true,
      maxFailedAttempts: 5,  // or user's custom value
      lockDurationMinutes: 15, // or user's custom value
    },
  },

  // If using nodemailer:
  email: { adapter: 'nodemailer' },
  // If using console (dev):
  email: { adapter: 'console' },
});
```

**Important rules when integrating:**
- Place `createAuthModule()` AFTER `express.json()` middleware
- Place it BEFORE any custom error handlers
- If the user has an existing MongoDB connection, reuse it — don't create a second one
- If the user already has `cookie-parser`, remove the duplicate
- Preserve all of the user's existing routes and middleware

---

## Step 6: Update tsconfig.json

Ensure these compiler options are set:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

Only modify settings that are missing or conflicting. Don't overwrite the user's existing config.

---

## Step 7: Verify

Run these checks:

```bash
# 1. TypeScript compilation
npx tsc --noEmit
# Must show zero errors

# 2. Start server
npm run dev
# Must start without errors

# 3. Test registration
curl -X POST http://localhost:<PORT>/<mount-path>/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}' \
  -c cookies.txt

# 4. Test login
curl -X POST http://localhost:<PORT>/<mount-path>/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test1234!"}' \
  -c cookies.txt

# 5. Test authenticated route
curl http://localhost:<PORT>/<mount-path>/me -b cookies.txt
```

---

## Step 8: Summary

After everything is working, give the user a summary:

> **✅ Authentication is set up! Here's what's available:**
>
> | Endpoint | Description |
> |---|---|
> | POST `<path>/register` | Create an account |
> | POST `<path>/login` | Login |
> | POST `<path>/logout` | Logout |
> | GET `<path>/me` | Get profile |
> | ... | (list all enabled endpoints) |
>
> **Next steps:**
> - Check out the docs in `src/auth/` for customization
> - For production: set `NODE_ENV=production`, use HTTPS, set real SESSION_SECRET
> - To protect your own routes, use the `requireAuth` middleware:
>   ```typescript
>   import { requireAuth } from './auth/http/middleware/require-auth.js';
>   app.get('/api/protected', requireAuth, handler);
>   ```

---

## Important Notes for the AI Agent

- **Never expose `passwordHash`** in any API response
- **Use identical error messages** for "user not found" and "wrong password" (enumeration protection)
- **Don't modify files inside `src/auth/`** — configure through `createConfig()` only
- If the user's project uses CommonJS (`require`), they need to switch to ESM or use dynamic `import()`
- The auth module requires MongoDB — it won't work with SQL databases without implementing new repository adapters
