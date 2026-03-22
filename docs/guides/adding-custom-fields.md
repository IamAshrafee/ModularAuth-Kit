# Guide: Adding Custom Fields

Add custom fields to the user model (e.g., `phone`, `avatar`, `bio`).

## Steps

### 1. Update `auth.types.ts`

Add the field to `CreateUserDto` and `UpdateProfileDto`:

```typescript
export interface CreateUserDto {
  email: string;
  passwordHash?: string;
  phone?: string;        // ← Add here
}
```

### 2. Update the Mongoose Model

In `src/auth/models/user.model.ts`, add the field to the schema:

```typescript
phone: { type: String, trim: true },
```

### 3. Update Validation Schemas

In `src/auth/http/schemas/`, add Zod validation for the new field:

```typescript
phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
```

### 4. Update the Controller

In the register/update profile controller, pass the new field through to the service.

### 5. Verify

```bash
npx tsc --noEmit  # Zero errors
npm run dev        # Test the endpoint
```

## Important

- Never add `passwordHash` to any response — the profile mapping already excludes it
- Add the field to your `sanitizeUser()` mapping if it should appear in responses
- Custom fields that are required should be validated with Zod `.min(1)` or similar
