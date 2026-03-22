# Guide: Modifying Auth Flows

Customize registration, login, and other auth flows.

## Custom Registration Logic

To add actions after registration (e.g., create a profile, send welcome email):

1. Modify `AuthService.register()` in `src/auth/services/auth.service.ts`
2. Add your logic after the user is created but before the response

```typescript
// In auth.service.ts → register()
const user = await this.userRepo.create({ email, passwordHash: hash });

// Add your custom logic here:
await this.sendWelcomeEmail(user);
await this.createDefaultProfile(user._id.toString());
```

## Custom Login Validation

To add extra checks during login (e.g., email domain restriction):

```typescript
// In auth.service.ts → login(), after finding the user
if (!user.email.endsWith('@mycompany.com')) {
  throw new AuthError(403, 'FORBIDDEN', 'Only company emails allowed');
}
```

## Custom Post-Login Actions

Add actions after successful login:

```typescript
// In auth.service.ts → login(), after successful password verification
await this.updateLastLogin(user._id.toString());
await this.notifyNewLogin(user.email, meta.ip);
```

## Where Logic Lives

| What | Where |
|---|---|
| Business logic | `src/auth/services/` |
| Request parsing | `src/auth/http/controllers/` |
| Validation rules | `src/auth/http/schemas/` |
| Route mounting | `src/auth/http/routes/` |

**Rule:** Controllers should be thin — all business logic belongs in services.
