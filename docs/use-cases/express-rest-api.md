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

## Step 1: Install Missing Dependencies

You likely already have `express` and `mongoose`. Install only what's missing:

```bash
npm install argon2 helmet cookie-parser zod      # skip any you already have
```

## Step 2: Add SESSION_SECRET to Your .env

Add one line to your **existing** `.env` file:

```bash
SESSION_SECRET=your-random-64-char-secret-here
```

> 💡 That's the only new env var needed. Your existing `MONGODB_URI` is already handled — the auth module reuses whatever Mongoose connection your project has.

## Step 3: Mount Auth (Add to Your Existing App)

Add 3 lines to your existing Express setup:

```typescript
// In your existing app.ts or server.ts
import { createConfig, createAuthModule } from './auth/index.js';

// After your existing mongoose.connect() and app.use(express.json())...
const config = createConfig({
  session: { secure: false }, // Set true in production with HTTPS
});

app.use('/auth', createAuthModule(config));

// Your existing routes continue to work as before
app.get('/api/products', (req, res) => {
  res.json({ products: [] });
});
```

> ⚠️ **No need to call `connectDatabase()`** if you already have `mongoose.connect()` in your project. The auth module automatically uses your active Mongoose connection.

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
- ✅ argon2id password hashing
- ✅ Helmet security headers
