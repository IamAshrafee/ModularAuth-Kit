[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Dependency Audit

Why each npm package was chosen, what alternatives exist, and what each dependency does.

---

## Table of Contents

- [Production Dependencies](#production-dependencies)
- [Development Dependencies](#development-dependencies)
- [Dependency Principles](#dependency-principles)

---

## Production Dependencies

| Package | Version | Purpose | Why This One | Alternatives Considered |
|---|---|---|---|---|
| **express** | ^4.x | HTTP framework | Industry standard, minimal, flexible, massive ecosystem | Fastify (faster but less ecosystem), Koa (smaller community) |
| **mongoose** | ^8.x | MongoDB ODM | Schema validation, middleware hooks, TypeScript support, most popular MongoDB library | MongoDB native driver (lower level, more manual), Prisma (heavier, less MongoDB-native) |
| **argon2** | ^0.x | Password hashing | OWASP #1 recommendation, memory-hard, no password length limit | bcrypt (72-byte limit, no memory-hardness), scrypt (less configurable) |
| **zod** | ^3.x | Input validation | TypeScript-native type inference, dynamic schema composition, smallest bundle | Joi (no type inference, larger), Yup (React-focused), class-validator (decorator-based) |
| **helmet** | ^7.x | Security headers | One-line setup for all OWASP-recommended HTTP headers | Manual header setting (error-prone), csp (CSP-only) |
| **express-rate-limit** | ^7.x | Rate limiting | Simple, configurable, Express-native, supports custom stores | rate-limiter-flexible (more complex, Redis-focused) |
| **cookie-parser** | ^1.x | Cookie parsing | Required for reading session cookies from requests | Built-in parsing (manual, error-prone) |
| **dotenv** | ^16.x | Environment variables | Standard `.env` file loading | direct `process.env` (no `.env` file support) |
| **uuid** | ^9.x | UUID generation | RFC 4122 compliant, multiple versions | crypto.randomUUID() (Node 19+, limited), nanoid (non-standard format) |
| **ua-parser-js** | ^1.x | User-Agent parsing | Most popular UA parser, well-maintained, comprehensive device detection | platform (less maintained), express-useragent (Express-specific) |
| **nodemailer** | ^6.x | Email sending | Most popular Node.js email library, works with any SMTP, HTML + text support | SendGrid SDK (vendor-locked), AWS SES SDK (vendor-locked) |

---

## Development Dependencies

| Package | Version | Purpose | Why This One |
|---|---|---|---|
| **typescript** | ^5.x | TypeScript compiler | Required for `.ts` → `.js` compilation, strict type checking |
| **tsx** | ^4.x | TypeScript execution | Run `.ts` files directly in development, fast hot-reload with `--watch` |
| **@types/express** | ^4.x | Express type definitions | TypeScript types for Express `Request`, `Response`, etc. |
| **@types/cookie-parser** | ^1.x | Cookie-parser types | TypeScript types for `req.cookies` |
| **@types/uuid** | ^9.x | UUID types | TypeScript types for uuid functions |
| **@types/ua-parser-js** | ^0.x | UA-parser types | TypeScript types for parsed UA results |
| **@types/nodemailer** | ^6.x | Nodemailer types | TypeScript types for transport, message options |
| **@types/node** | ^20.x | Node.js types | TypeScript types for Node.js built-in modules (crypto, etc.) |

---

## Dependency Principles

1. **Minimal dependencies.** Every dependency must justify its existence. If we can achieve the same thing with a few lines of code, we don't add a package.

2. **No vendor lock-in.** We use standard/generic packages (Nodemailer, not SendGrid SDK). Adapters handle provider-specific logic.

3. **Well-maintained packages.** Every dependency must be actively maintained with regular updates and security patches.

4. **No overlapping functionality.** No two packages should do the same thing.

5. **Security auditable.** Run `npm audit` regularly. Zero known vulnerabilities is the target.

---

> 📖 **Related Docs:**
> - [ADR-001: Password Hashing](../decisions/adr-001-password-hashing.md) — why argon2 over bcrypt
> - [ADR-003: Zod Validation](../decisions/adr-003-zod-validation.md) — why Zod over Joi
> - [ADR-004: No Passport.js](../decisions/adr-004-no-passport.md) — why no passport dependency
