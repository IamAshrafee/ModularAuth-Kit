# Registration Configuration

Configure which fields are collected during registration and validation rules.

## Optional Fields

```typescript
createConfig({
  registration: {
    fields: {
      username:  { enabled: true, required: true },
      fullName:  { enabled: true, required: false },
      firstName: { enabled: true, required: false },
      lastName:  { enabled: true, required: false },
    },
  },
});
```

| Field | Default | Description |
|---|---|---|
| `username` | disabled | Unique username with pattern validation |
| `fullName` | disabled | Full name string |
| `firstName` | disabled | First name |
| `lastName` | disabled | Last name |

Each field has `enabled` (mounts the field) and `required` (validates presence).

## Password Validation

```typescript
createConfig({
  registration: {
    validation: {
      password: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: false,
      },
    },
  },
});
```

## Username Validation

```typescript
createConfig({
  registration: {
    validation: {
      username: {
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_]+$/,
      },
    },
  },
});
```

## Email Validation

```typescript
createConfig({
  registration: {
    validation: {
      email: {
        maxLength: 254,
      },
    },
  },
});
```
