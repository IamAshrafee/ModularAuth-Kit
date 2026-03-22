[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# ADR-003: Zod for Input Validation

## Status
**Accepted**

## Context
We need a validation library to validate all incoming request bodies. The main contenders are **Joi** (most popular, established), **Yup** (popular with React), and **Zod** (TypeScript-native, newer).

## Decision
We will use **Zod** for all request validation and schema definition.

## Rationale

| Factor | Zod ✅ | Joi ❌ | Yup ❌ |
|---|---|---|---|
| **TypeScript Integration** | ✅ Infers types from schemas | ❌ Requires separate type definitions | ❌ Requires separate type definitions |
| **Type Safety** | ✅ `z.infer<typeof schema>` gives the exact type | ❌ Manual type sync | ❌ Manual type sync |
| **Bundle Size** | ✅ ~13KB min | ❌ ~69KB | ❌ ~28KB |
| **API Design** | ✅ Declarative, chainable | ✅ Declarative, chainable | ✅ Declarative, chainable |
| **Ecosystem** | ✅ Growing rapidly | ✅ Mature, large | ✅ Mature, React-focused |
| **Error Messages** | ✅ Customizable, structured | ✅ Customizable | ✅ Customizable |

### Key Reasons

**1. TypeScript type inference.**
Zod schemas double as type definitions. When we define a validation schema, we automatically get the TypeScript type — no duplication, no drift.

```typescript
// Define schema once
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Type is automatically inferred — no separate interface needed
type RegisterDto = z.infer<typeof registerSchema>;
// { email: string; password: string }
```

**2. Dynamic schema composition.**
Our config system needs to build schemas dynamically (add/remove fields based on switches). Zod's `.extend()`, `.omit()`, `.partial()`, and `.merge()` make this clean:

```typescript
let schema = baseSchema;
if (config.registration.fields.username.enabled) {
  schema = schema.extend({ username: z.string().min(3) });
}
```

**3. Smaller footprint.**
At ~13KB minified, Zod is the smallest option — important for a module that aims to be lightweight.

## Consequences
- **Positive:** Zero type duplication, schemas and types always in sync
- **Positive:** Dynamic schema composition works naturally with our switch system
- **Positive:** Smallest bundle size
- **Negative:** Newer than Joi — smaller community (but growing fast)
- **Negative:** Some edge cases have different behavior than Joi (migration concern for developers familiar with Joi)

## Alternatives Considered
- **Joi:** Rejected — requires separate TypeScript type definitions, larger bundle
- **Yup:** Rejected — React-focused, same type duplication problem as Joi
- **class-validator:** Rejected — decorator-based, doesn't fit our functional approach

---

> 📖 **Related:** [Config System](../architecture/config-system.md) — how schemas are built dynamically.
