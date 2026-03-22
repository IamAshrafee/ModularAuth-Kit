# Guide: Extending Middleware

Add custom middleware to auth routes (logging, IP filtering, custom headers, etc.).

## Adding Middleware to All Auth Routes

In `app.ts`, add middleware before mounting the auth module:

```typescript
// Custom middleware applied to all /auth routes
app.use('/auth', myCustomMiddleware, createAuthModule(config));
```

## Adding Route-Level Middleware

To add middleware to specific routes, modify `auth.routes.ts`:

```typescript
// Before a specific route
router.post('/register', myMiddleware, authController.register);
```

## Custom Authentication Check

The built-in `requireAuth` middleware validates the session cookie. To add extra checks:

```typescript
// src/auth/http/middleware/custom-auth.ts
import type { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required', details: [] }
    });
  }
  next();
}
```

Mount it after `requireAuth`:

```typescript
router.get('/admin-data', requireAuth, requireAdmin, controller.adminData);
```

## Available on `req`

After authentication, these are available:

| Property | Type | Description |
|---|---|---|
| `req.user` | `UserDocument` | Current user |
| `req.sessionId` | `string` | Current session ID |
