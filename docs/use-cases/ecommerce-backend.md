# Use Case: E-commerce Backend

Auth for an online store with user profiles, password recovery, and account security.

## Your Project Structure

```
shop-api/
├── src/
│   ├── auth/              ← ModularAuth-Kit
│   ├── products/
│   │   ├── product.model.ts
│   │   ├── product.routes.ts
│   │   └── product.controller.ts
│   ├── orders/
│   │   ├── order.model.ts
│   │   ├── order.routes.ts
│   │   └── order.controller.ts
│   ├── cart/
│   │   └── cart.routes.ts
│   ├── app.ts
│   └── server.ts
├── .env
└── package.json
```

## Configuration

E-commerce needs: email/password, password recovery, account lockout.

```typescript
// src/server.ts
const config = createConfig({
  session: {
    secure: true,              // HTTPS in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7-day sessions
  },
  registration: {
    fields: {
      fullName: { enabled: true, required: true },
    },
  },
  passwordRecovery: {
    enabled: true,             // Customers forget passwords
  },
  security: {
    accountLockout: {
      enabled: true,
      maxFailedAttempts: 5,
      lockDurationMinutes: 15,
    },
  },
  email: {
    adapter: 'nodemailer',     // Real emails in production
  },
});

app.use('/auth', createAuthModule(config));
app.use('/api/products', productRoutes);
app.use('/api/orders', requireAuth, orderRoutes);  // Protected
app.use('/api/cart', requireAuth, cartRoutes);      // Protected
```

## Environment Variables

Add only `SESSION_SECRET` and email config to your **existing** `.env`:

```bash
SESSION_SECRET=<64-char-random-string>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=shop@example.com
SMTP_PASS=app-password
EMAIL_FROM=noreply@myshop.com
```

> 💡 Your existing `MONGODB_URI` is reused automatically — no extra DB setup.

## Customer Flow

```bash
# 1. Customer registers with name
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"Shop1234!","fullName":"Jane Doe"}' \
  -c cookies.txt

# 2. Customer browses products (public)
curl http://localhost:3000/api/products

# 3. Customer adds to cart (auth required)
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"abc123","quantity":2}' \
  -b cookies.txt

# 4. Customer forgot password
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"identifier":"customer@example.com"}'
# → Email sent with reset token

# 5. Customer resets password
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<from-email>","newPassword":"NewShop1234!"}'
```

## Features Used

| Feature | Why |
|---|---|
| Full name field | Customer profiles |
| Password recovery | Customers forget passwords |
| Account lockout | Protect against brute force |
| Nodemailer | Send real password reset emails |
| Long sessions | Convenience for returning customers |
