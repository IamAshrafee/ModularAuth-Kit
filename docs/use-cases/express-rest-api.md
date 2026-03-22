# Use Case: Express REST API

Add authentication to a standard Express.js + TypeScript REST API.

## Your Project Structure

```
my-api/
├── src/
│   ├── auth/              ← Copy ModularAuth-Kit's src/auth/ here
│   ├── routes/
│   │   ├── products.ts    ← Your business routes
│   │   └── orders.ts
│   ├── middleware/
│   │   └── custom.ts      ← Your custom middleware
│   ├── app.ts             ← Express setup
│   └── server.ts          ← Entry point
├── .env
├── package.json
└── tsconfig.json
```

## Step 1: Install Dependencies

```bash
npm install express mongoose bcrypt helmet cookie-parser zod dotenv
npm install -D typescript @types/express @types/bcrypt @types/cookie-parser tsx
```

## Step 2: Environment Variables

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/myapi
SESSION_SECRET=your-random-64-char-secret-here
PORT=3000
```

## Step 3: Configure Auth

```typescript
// src/server.ts
import 'dotenv/config';
import express from 'express';
import { createConfig, createAuthModule } from './auth/index.js';
import { connectDatabase } from './auth/adapters/database/mongodb.adapter.js';

async function bootstrap() {
  await connectDatabase(process.env.MONGODB_URI!);

  const app = express();
  app.use(express.json());

  // Auth config — enable only what you need
  const config = createConfig({
    session: { secure: false }, // Set true in production with HTTPS
  });

  // Mount auth at /auth
  app.use('/auth', createAuthModule(config));

  // Your business routes (protected)
  app.get('/api/products', (req, res) => {
    res.json({ products: [] });
  });

  app.listen(3000, () => console.log('Running on :3000'));
}

bootstrap();
```

## Step 4: Protect Your Routes

```typescript
// To protect your own routes, import the requireAuth middleware:
import { requireAuth } from './auth/http/middleware/require-auth.js';

// Protected route — only logged-in users
app.get('/api/orders', requireAuth, (req, res) => {
  const userId = req.user!._id.toString();
  res.json({ orders: [], userId });
});

// Public route — no auth needed
app.get('/api/products', (req, res) => {
  res.json({ products: [] });
});
```

## Step 5: Test It

```bash
# Start server
npm run dev

# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"MyPass123!"}' \
  -c cookies.txt

# Access protected route (with session cookie)
curl http://localhost:3000/api/orders -b cookies.txt

# Access without auth (should fail)
curl http://localhost:3000/api/orders
# → 401 Unauthorized
```

## What You Get

With this minimal setup:
- ✅ `POST /auth/register` — Create accounts
- ✅ `POST /auth/login` — Login with email + password
- ✅ `POST /auth/logout` — Logout
- ✅ `GET /auth/me` — Get current user profile
- ✅ `POST /auth/change-password` — Change password
- ✅ Session-based auth with httpOnly cookies
- ✅ bcrypt password hashing
- ✅ Helmet security headers
