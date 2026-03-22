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

## The Entire Setup (One File)

```typescript
// src/server.ts
import 'dotenv/config';
import express from 'express';
import { createConfig, createAuthModule } from './auth/index.js';
import { connectDatabase } from './auth/adapters/database/mongodb.adapter.js';

async function main() {
  // Connect to MongoDB
  await connectDatabase(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/myapp');

  const app = express();
  app.use(express.json());

  // Minimal config — just disable HTTPS for local dev
  const config = createConfig({
    session: { secure: false },
  });

  // Mount auth
  app.use('/auth', createAuthModule(config));

  // Your app route
  app.get('/', (req, res) => {
    res.json({ message: 'Hello! Visit /auth/register to create an account.' });
  });

  app.listen(3000, () => console.log('http://localhost:3000'));
}

main();
```

## Environment Variables

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/myapp
SESSION_SECRET=any-random-string-at-least-32-chars-long
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
