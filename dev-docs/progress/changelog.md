[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Development Changelog

Track of what was built, when, and what changed in each phase.

---

## [2026-03-22] Phase 0 — Planning & Documentation

### Project Setup
- Initialized `package.json` with dev/build/start scripts
- Configured `tsconfig.json` (strict mode, ES2022, Node16 module resolution)
- Created `.env.example` with all environment variables documented
- Created `.gitignore`

### Dependencies Installed
**Production:**
- `express` — HTTP framework
- `mongoose` — MongoDB ODM
- `argon2` — Password hashing (argon2id)
- `zod` — Request validation
- `helmet` — Security headers
- `express-rate-limit` — Rate limiting
- `cookie-parser` — Cookie parsing
- `dotenv` — Environment variables
- `uuid` — UUID generation
- `ua-parser-js` — User-agent parsing
- `nodemailer` — Email sending

**Development:**
- `typescript` — TypeScript compiler
- `tsx` — TypeScript execution (dev mode)
- `@types/*` — Type definitions for all packages

### Documentation
- Wrote comprehensive `Project_introduction.md` (~600 lines)
- Created complete internal documentation (`dev-docs/`):
  - 8 architecture docs (overview, folder structure, database design, sessions, tokens, OAuth, config, errors)
  - 6 decision records (argon2id, sessions vs JWT, Zod, no Passport.js, repository pattern, template)
  - 4 convention docs (coding standards, API response format, testing guidelines, documentation guidelines)
  - 1 progress doc (this changelog)
  - 2 reference docs (OWASP checklist, dependency audit)

---

*Entries will be added as each implementation phase is completed.*
