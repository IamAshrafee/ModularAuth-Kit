# ModularAuth-Kit — AI Agent Integration Prompt

> **Copy this entire file and paste it as a prompt to your AI coding agent.**
> The agent will learn your project first, then guide you through integrating authentication.

---

## Your Role

You are integrating **ModularAuth-Kit** — a pre-built authentication module — into the user's existing (or new) project. The `src/auth/` folder has already been copied into their project.

**Your approach must be: Check Compatibility → Learn First → Ask Smart Questions → Integrate → Verify.**

Never assume anything about the project. Discover everything by reading files.

---

## Phase 0: Compatibility Check (STOP HERE If Incompatible)

Before doing anything else, verify the project is compatible.

### Read `package.json` and check:

1. **Is this a Node.js project?** (has `package.json` with dependencies)
2. **Does it use Express.js?** (has `express` in dependencies)
3. **Does it use MongoDB/Mongoose?** (has `mongoose` in dependencies, or will need it)

### Immediately STOP and tell the user if:

| Found | What to Say |
|---|---|
| **No `package.json`** | "This doesn't appear to be a Node.js project. ModularAuth-Kit requires Node.js + Express.js + MongoDB." |
| **Next.js** (`next` in deps) | "ModularAuth-Kit is built for Express.js and isn't compatible with Next.js API routes. You'd need an Express-based auth solution for Next.js (e.g., NextAuth.js)." |
| **NestJS** (`@nestjs/core` in deps) | "ModularAuth-Kit is built for Express.js. While NestJS uses Express under the hood, the module doesn't follow NestJS patterns (decorators, guards, modules). Integration is possible but not recommended. Do you want to proceed anyway?" |
| **Fastify** (`fastify` in deps) | "ModularAuth-Kit is built for Express.js and isn't compatible with Fastify's middleware system." |
| **Hono** (`hono` in deps) | "ModularAuth-Kit is built for Express.js and isn't compatible with Hono." |
| **No Express** (no `express` in deps) | "I don't see Express.js in your dependencies. ModularAuth-Kit requires Express.js. Would you like me to install Express and set up a basic server first?" |
| **Python/Go/Other** (no `package.json`) | "ModularAuth-Kit is a TypeScript module for Node.js + Express.js. It can't be used with [language] projects." |

### If compatible, proceed to Phase 1.

---

## Phase 1: Learn the Project (MANDATORY — Do This Before Anything Else)

Before asking the user a single question, silently read and understand their project.

### 1.1 Read Core Files

Read these files (if they exist) and take note of everything:

```
package.json           → What deps are already installed? Express version?
tsconfig.json          → Module system (ESM/CJS)? Strict mode? Paths?
.env / .env.example    → What env vars already exist? Is MONGODB_URI there?
```

### 1.2 Find the Express App

Search for the main Express setup file. It's usually one of:
- `src/app.ts`, `src/server.ts`, `src/index.ts`
- `app.ts`, `server.ts`, `index.ts`

Read it and identify:
- [ ] Where is `express()` created?
- [ ] Where is `app.use(express.json())` called?
- [ ] Is there an existing `mongoose.connect()` call?
- [ ] Is there an existing `cookie-parser` setup?
- [ ] Is there an existing `helmet()` setup?
- [ ] Is there a custom error handler at the bottom?
- [ ] What port does the server listen on?
- [ ] Are there existing route mounts? (e.g., `app.use('/api', ...)`)

### 1.3 Understand the Folder Structure

```
List: src/ directory (top-level)
```

Determine:
- Is this a new/empty project or an established one with existing routes?
- Where do they put routes, controllers, middleware?
- Is there an existing auth system that needs replacement?

### 1.4 Check for Conflicts

Look for things that could conflict:
- Existing `/auth` routes → will our module collide?
- Existing session middleware → do they already have express-session?
- Existing `User` model → will Mongoose have schema conflicts?
- Existing `cookie-parser` → avoid duplicating middleware

### 1.5 Build a Mental Model

After reading, you should know:

| Question | Answer |
|---|---|
| Project type | New project / Existing with routes |
| Has MongoDB connected? | Yes (skip DB setup) / No (need it) |
| Has express.json()? | Yes (skip) / No (add it) |
| Has cookie-parser? | Yes (skip) / No (installed by auth module) |
| Has helmet? | Yes (skip) / No (installed by auth module) |
| Module system | ESM / CJS |
| Existing auth routes? | Yes (warn about collision) / No |
| Missing dependencies | List exactly what's missing |

---

## Phase 2: Ask Smart Questions (Fewer Questions = Better UX)

Now you know the project. Ask the user ONLY what you can't determine from the code.

### Present Your Understanding First

> **I've analyzed your project. Here's what I found:**
>
> - **Express app:** `src/server.ts` (Express 5.x)
> - **MongoDB:** Already connected via `mongoose.connect()` ✅
> - **Missing deps:** `argon2`, `zod` (need to install)
> - **Existing routes:** `/api/products`, `/api/orders`
> - **No auth system found** — clean integration
>
> **I need a few answers to configure authentication:**
>
> 1. **Which features?** (yes/no each)
>    - [ ] Password recovery (forgot/reset password)?
>    - [ ] Email verification (OTP after registration)?
>    - [ ] Google OAuth (login with Google)?
>    - [ ] Login history tracking?
>    - [ ] Session management (list/revoke devices)?
>    - [ ] Account lockout (lock after failed attempts)?
>    - [ ] Username support (register/login with username)?
>
> 2. **Mount path?** Default is `/auth` → endpoints like `/auth/login`
>    - Or do you want `/api/auth`? Something else?

**DO NOT ask about:**
- MongoDB URI (you already know if they have it)
- Port (you already read it)
- Dependencies they already have
- Things you can determine from the code

### Ask Feature-Specific Follow-ups (Only If Needed)

**If Google OAuth = Yes:**
> I need your Google OAuth credentials (or I'll add placeholders):
> - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

**If Email Features = Yes:**
> For emails — use `console` adapter (prints to terminal, great for dev) or `nodemailer` (needs SMTP)?

**If Account Lockout = Yes:**
> Lockout settings — defaults are 5 attempts, 15-minute lock. Want to change?

---

## Phase 3: Install Only What's Missing

Based on Phase 1 analysis, install ONLY dependencies that aren't already in `package.json`:

```bash
# Example — skip what's already installed:
npm install argon2 zod          # only these were missing
```

Full dependency list (install only what's missing):
- `argon2` — password hashing
- `cookie-parser` — cookie parsing
- `dotenv` — env var loading
- `express` — web framework
- `helmet` — security headers
- `mongoose` — MongoDB ODM
- `zod` — input validation
- `nodemailer` — only if user chose nodemailer adapter

---

## Phase 4: Add Environment Variables

Add to the user's **existing** `.env` file. Do NOT create a separate file.

**Always add:**
```bash
SESSION_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

**Do NOT add `MONGODB_URI`** if the project already has it.

**Add feature-specific vars only if enabled:**
```bash
# Google OAuth (only if enabled)
GOOGLE_CLIENT_ID=<from user or placeholder>
GOOGLE_CLIENT_SECRET=<from user or placeholder>
GOOGLE_CALLBACK_URL=http://localhost:<PORT>/auth/google/callback

# Nodemailer (only if using nodemailer adapter)
SMTP_HOST=<from user>
SMTP_PORT=587
SMTP_USER=<from user>
SMTP_PASS=<from user>
EMAIL_FROM=<from user>
```

---

## Phase 5: Integrate Into the Existing App

Modify the user's **existing** Express app file. Do NOT rewrite it.

### Rules

1. **Add imports at the top** (with their existing imports)
2. **Place auth mount AFTER** `express.json()` and `cookie-parser`
3. **Place auth mount BEFORE** custom error handlers
4. **Do NOT duplicate** middleware they already have (cookie-parser, helmet, etc.)
5. **Do NOT touch** their existing routes or business logic
6. **Preserve** everything that already exists in the file

### What to Add (Typically 3-5 Lines)

```typescript
// Add to imports
import { createConfig, createAuthModule } from './auth/index.js';

// Add after express.json() middleware, before routes
const authConfig = createConfig({
  session: {
    secure: process.env.NODE_ENV === 'production',
  },
  // ... features based on user's answers
});

app.use('/auth', createAuthModule(authConfig));  // or user's chosen mount path
```

### Config Builder Reference

Build the config based on Phase 2 answers:

```typescript
const authConfig = createConfig({
  session: {
    secure: process.env.NODE_ENV === 'production',
  },

  // If username enabled:
  registration: {
    fields: {
      username: { enabled: true, required: true },
      fullName: { enabled: true, required: false },
    },
  },

  // If username login enabled:
  login: {
    identifiers: ['email', 'username'],
    allowGoogleOAuth: false,  // true if Google OAuth enabled
  },

  // Feature flags — only include what user said Yes to:
  passwordRecovery: { enabled: true },
  emailVerification: { enabled: true, requiredForLogin: false },
  loginHistory: { enabled: true },
  sessionManagement: { enabled: true },

  // Security:
  security: {
    accountLockout: {
      enabled: true,
      maxFailedAttempts: 5,
      lockDurationMinutes: 15,
    },
  },

  // Email adapter:
  email: { adapter: 'console' },  // or 'nodemailer'
});
```

---

## Phase 6: Verify

Run these checks in order. Stop and fix any failures before continuing.

```bash
# 1. TypeScript compilation — must be zero errors
npx tsc --noEmit

# 2. Start the server — must start without crashes
npm run dev

# 3. Test registration
curl -X POST http://localhost:<PORT>/<path>/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}' \
  -c cookies.txt

# 4. Test login
curl -X POST http://localhost:<PORT>/<path>/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test1234!"}' \
  -c cookies.txt

# 5. Test authenticated endpoint
curl http://localhost:<PORT>/<path>/me -b cookies.txt
```

All 5 checks must pass before reporting success.

---

## Phase 7: Report to the User

Give the user a clear summary of what was done:

> **✅ Authentication integrated!**
>
> **What I did:**
> - Installed: `argon2`, `zod` (2 new packages)
> - Added `SESSION_SECRET` to `.env`
> - Added 5 lines to `src/server.ts`
> - No changes to your existing routes or models
>
> **Available endpoints:**
> | Endpoint | Description |
> |---|---|
> | POST `/auth/register` | Create account |
> | POST `/auth/login` | Login |
> | ... | |
>
> **To protect your routes:**
> ```typescript
> import { requireAuth } from './auth/http/middleware/require-auth.js';
> app.get('/api/protected', requireAuth, handler);
> ```

---

## Important Rules for the AI Agent

1. **Never modify files inside `src/auth/`** — configure through `createConfig()` only
2. **Never expose `passwordHash`** in any API response
3. **Use identical error messages** for "user not found" and "wrong password"
4. **Don't create duplicate middleware** — check what already exists first
5. **Don't ask questions you can answer from the code** — read files first
6. **The auth module reuses the active Mongoose connection** — no extra DB setup needed
7. If the user's project uses CommonJS, they need to switch to ESM or use dynamic `import()`
8. The auth module requires MongoDB — it won't work with SQL databases without custom repository adapters
