# Use Case: Minimal Setup

The absolute bare minimum to get auth working. Just register + login.

## Your Project Structure

```
my-app/
├── src/
│   ├── auth/              ← Copy ModularAuth-Kit's src/auth/ here
│   └── server.ts          ← Single file setup
├── .env
└── package.json
```

## The Entire Setup (Add to Your Existing Server)

```typescript
// In your existing server.ts — add these 3 lines
import { createConfig, createAuthModule } from './auth/index.js';

const config = createConfig({ session: { secure: false } });
app.use('/auth', createAuthModule(config));
```

Add one env var to your existing `.env`:

```bash
SESSION_SECRET=any-random-string-at-least-32-chars-long
```

> 💡 If you already have `mongoose.connect()`, that's all you need. No `MONGODB_URI` or `connectDatabase()`.

### New Project?

If starting fresh, you also need MongoDB and Express:

```typescript
// src/server.ts
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { createConfig, createAuthModule } from './auth/index.js';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/myapp');

  const app = express();
  app.use(express.json());

  const config = createConfig({ session: { secure: false } });
  app.use('/auth', createAuthModule(config));

  app.get('/', (req, res) => {
    res.json({ message: 'Hello! Visit /auth/register to create an account.' });
  });

  app.listen(3000, () => console.log('http://localhost:3000'));
}

main();
```

## Test It

```bash
# 1. Start
npm run dev

# 2. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"me@test.com","password":"Test1234!"}' \
  -c cookies.txt

# 3. Check profile
curl http://localhost:3000/auth/me -b cookies.txt

# 4. Logout
curl -X POST http://localhost:3000/auth/logout -b cookies.txt

# 5. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"me@test.com","password":"Test1234!"}' \
  -c cookies.txt
```

## What You Get (With Zero Config)

- `POST /auth/register` — Register with email + password
- `POST /auth/login` — Login
- `POST /auth/logout` — Logout
- `POST /auth/logout-all` — Logout all devices
- `GET /auth/me` — Get profile
- `PATCH /auth/me` — Update profile
- `POST /auth/change-password` — Change password

That's it. **5 lines of config, 7 endpoints.** Add more features as you need them.
