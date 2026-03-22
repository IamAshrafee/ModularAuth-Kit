# Project Structure

## Overview

ModularAuth-Kit is a **drop-in auth module** for Express.js applications. Everything lives inside `src/auth/`.

## Entry Point

```typescript
import { createAuthModule, createConfig } from './auth';

// 1. Create config (merges your overrides with secure defaults)
const config = createConfig({
  session: { secure: false }, // dev override
  passwordRecovery: { enabled: true },
});

// 2. Mount the auth module
app.use('/auth', createAuthModule(config));
```

That's it. One import, two function calls.

## Folder Structure

```
src/auth/
├── index.ts                    ← Entry point (createAuthModule)
├── auth.config.ts              ← Config factory (createConfig)
├── auth.constants.ts           ← Constants and messages
├── auth.types.ts               ← TypeScript types
│
├── services/                   ← Business logic
│   ├── auth.service.ts         ← Register, login, logout, password
│   ├── session.service.ts      ← Session CRUD, validation, rotation
│   ├── token.service.ts        ← Password reset / email verification tokens
│   ├── email.service.ts        ← Email composition and sending
│   ├── oauth.service.ts        ← Google OAuth 2.0 flow
│   └── login-history.service.ts← Login event recording
│
├── http/
│   ├── controllers/            ← Request → Service → Response
│   ├── middleware/              ← Auth, validation, rate limiting, security
│   ├── routes/                 ← Route mounting
│   └── schemas/                ← Zod validation schemas
│
├── repositories/
│   ├── interfaces/             ← Database-agnostic contracts
│   └── mongodb/                ← MongoDB implementations
│
├── models/                     ← Mongoose schemas
├── adapters/                   ← External integrations (email, database)
├── errors/                     ← Custom error classes
└── utils/                      ← Helpers (crypto, device parser, audit logger)
```

## Key Exports

| Export | Description |
|---|---|
| `createAuthModule(config)` | Returns a fully wired Express Router |
| `createConfig(overrides?)` | Merges overrides with secure defaults |
| `AuthConfig` | TypeScript type for configuration |
| `AuthError` | Custom error class for auth errors |
| `UserDocument` | TypeScript type for user documents |
