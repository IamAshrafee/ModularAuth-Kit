# ModularAuth-Kit — Documentation Structure Plan

Two documentation folders, each with a clear audience and purpose.

---

## Folder Overview

```
ModularAuth-Kit/
├── dev-docs/                     ← FOR THE BUILD TEAM (internal)
│   ├── README.md                 ← Dev docs index + table of contents
│   ├── architecture/
│   ├── decisions/
│   ├── conventions/
│   ├── progress/
│   └── references/
│
├── docs/                         ← FOR KIT USERS (external/public)
│   ├── README.md                 ← User docs index + table of contents
│   ├── getting-started/
│   ├── configuration/
│   ├── api/
│   ├── guides/
│   └── security/
│
└── Project_introduction.md       ← Project-level overview (both audiences)
```

---

## `dev-docs/` — Internal Development Documentation

> **Audience:** You, your team, any AI agent working on building/maintaining this project.
> **Purpose:** Everything needed to understand how the project is built, why decisions were made, coding conventions, and current progress.

### 📁 Structure

```
dev-docs/
├── README.md                          ← Index: links to all dev docs
│
├── architecture/                      ← HOW the system is built
│   ├── overview.md                    ← System architecture, layers, data flow
│   ├── folder-structure.md            ← Every folder/file explained
│   ├── database-design.md             ← Collections, schemas, indexes, relationships
│   ├── session-system.md              ← How sessions work internally
│   ├── token-system.md                ← How reset/verification tokens work
│   ├── oauth-flow.md                  ← Google OAuth flow step-by-step
│   ├── config-system.md               ← How the switch system works internally
│   └── error-handling.md              ← Error class hierarchy, error flow
│
├── decisions/                         ← WHY things are the way they are
│   ├── adr-001-password-hashing.md    ← Why argon2id over bcrypt
│   ├── adr-002-sessions-over-jwt.md   ← Why cookie sessions, not JWTs
│   ├── adr-003-zod-validation.md      ← Why Zod over Joi/Yup
│   ├── adr-004-no-passport.md         ← Why direct OAuth, not Passport.js
│   ├── adr-005-repository-pattern.md  ← Why repository interfaces
│   └── adr-template.md               ← Template for new ADRs
│
├── conventions/                       ← HOW we write code
│   ├── coding-standards.md            ← Naming, file structure, TypeScript rules
│   ├── api-response-format.md         ← Response envelope, error codes
│   ├── testing-guidelines.md          ← How to write/run tests
│   └── documentation-guidelines.md    ← How to write docs (both internal & user)
│
├── progress/                          ← WHERE we are
│   └── changelog.md                   ← Development changelog (what changed, when)
│
└── references/                        ← WHAT we consulted
    ├── owasp-checklist.md             ← OWASP requirements mapped to our implementation
    └── dependency-audit.md            ← Why each dependency exists, alternatives considered
```

### Document Details

| File | Must/Optional | Purpose |
|---|---|---|
| **README.md** | ◉ Must | Index page — links to every doc, serves as the entry point |
| **architecture/overview.md** | ◉ Must | High-level system architecture, layer diagram, data flow |
| **architecture/folder-structure.md** | ◉ Must | Every folder and file explained with its responsibility |
| **architecture/database-design.md** | ◉ Must | All 4 collections: fields, types, indexes, TTLs, relationships |
| **architecture/session-system.md** | ◉ Must | Session lifecycle: creation, validation, rotation, expiry, revocation |
| **architecture/token-system.md** | ◉ Must | Token generation, hashing, storage, validation, single-use enforcement |
| **architecture/oauth-flow.md** | ◉ Must | Google OAuth: redirect → callback → account creation/linking |
| **architecture/config-system.md** | ◉ Must | How switches work: route mounting, schema building, service branching |
| **architecture/error-handling.md** | ◉ Must | Error classes, how errors propagate, how they're formatted |
| **decisions/adr-*.md** | ◉ Must | Architecture Decision Records — the "why" behind every major choice |
| **decisions/adr-template.md** | ◉ Must | Standard template for new ADRs |
| **conventions/coding-standards.md** | ◉ Must | Naming rules, file patterns, TypeScript conventions |
| **conventions/api-response-format.md** | ◉ Must | The standard response envelope every endpoint must follow |
| **conventions/git-conventions.md** | ○ Optional | Branch/commit/PR conventions (useful if team grows) |
| **conventions/testing-guidelines.md** | ○ Optional | Test patterns, how to run tests, coverage expectations |
| **conventions/documentation-guidelines.md** | ○ Optional | How to write docs consistently |
| **progress/changelog.md** | ◉ Must | Track what was built, when, by whom |
| **references/owasp-checklist.md** | ◉ Must | Maps OWASP requirements → our implementation |
| **references/dependency-audit.md** | ○ Optional | Why each dependency was chosen, what alternatives exist |

---

## `docs/` — User-Facing Kit Documentation

> **Audience:** Developers who will copy and use this kit in their projects.
> **Purpose:** Everything needed to install, configure, use, and customize the auth kit.

### 📁 Structure

```
docs/
├── README.md                          ← Index: links to all user docs
│
├── getting-started/                   ← GET RUNNING FAST
│   ├── quick-start.md                 ← Zero to running in 5 minutes
│   ├── installation.md                ← Dependencies, setup, env vars
│   ├── project-structure.md           ← What's in the auth/ folder
│   └── environment-variables.md       ← Every env var explained
│
├── configuration/                     ← CONFIGURE THE SWITCHES
│   ├── overview.md                    ← How the config system works
│   ├── registration.md                ← Registration fields & validation rules
│   ├── login.md                       ← Login identifiers & options
│   ├── password-recovery.md           ← Forgot/reset password settings
│   ├── email-verification.md          ← Verification flow settings
│   ├── sessions.md                    ← Cookie & session settings
│   ├── google-oauth.md                ← Google OAuth setup guide
│   ├── login-history.md               ← Login history settings
│   ├── session-management.md          ← Device management settings
│   └── security.md                    ← Rate limiting, lockout, CSRF, headers
│
├── api/                               ← API REFERENCE
│   ├── overview.md                    ← Response format, error codes, auth headers
│   ├── auth-endpoints.md              ← Register, login, logout, profile
│   ├── password-endpoints.md          ← Forgot & reset password
│   ├── verification-endpoints.md      ← Email verification
│   ├── oauth-endpoints.md             ← Google OAuth
│   ├── session-endpoints.md           ← Active sessions, revoke device
│   ├── history-endpoints.md           ← Login history
│   └── error-codes.md                 ← Complete error code reference
│
├── guides/                            ← HOW-TO GUIDES
│   ├── adding-custom-fields.md        ← Add your own fields to the user model
│   ├── custom-email-provider.md       ← Write a custom email adapter
│   ├── custom-database.md             ← Add PostgreSQL/MySQL adapter
│   ├── extending-middleware.md         ← Add custom middleware to auth routes
│   ├── modifying-flows.md             ← Customize registration/login logic
│   └── deployment.md                  ← Production deployment checklist
│
└── security/                          ← SECURITY REFERENCE
    ├── overview.md                    ← Security philosophy & measures summary
    ├── password-security.md           ← Hashing, policy, timing attacks
    ├── session-security.md            ← Cookie flags, rotation, timeouts
    ├── token-security.md              ← Reset/verification token safety
    └── best-practices.md              ← Production security checklist
```

### Document Details

| File | Must/Optional | Purpose |
|---|---|---|
| **README.md** | ◉ Must | Index page — links to all user docs with brief descriptions |
| **getting-started/quick-start.md** | ◉ Must | Fastest path from zero to working auth (5 min) |
| **getting-started/installation.md** | ◉ Must | Step-by-step: copy folder, install deps, configure |
| **getting-started/project-structure.md** | ◉ Must | What each folder/file does in `src/auth/` |
| **getting-started/environment-variables.md** | ◉ Must | Every env var: name, type, required/optional, example |
| **configuration/overview.md** | ◉ Must | How the switch system works, config file location |
| **configuration/registration.md** | ◉ Must | Fields, validation rules, examples |
| **configuration/login.md** | ◉ Must | Identifier options, Google OAuth toggle |
| **configuration/password-recovery.md** | ◉ Must | Enable/disable, token settings |
| **configuration/email-verification.md** | ◉ Must | Enable/disable, OTP settings |
| **configuration/sessions.md** | ◉ Must | Cookie name, maxAge, idle timeout, security flags |
| **configuration/google-oauth.md** | ◉ Must | Google Cloud setup, credentials, callback URL |
| **configuration/login-history.md** | ◉ Must | Enable/disable, retention period |
| **configuration/session-management.md** | ◉ Must | Enable/disable, max sessions |
| **configuration/security.md** | ◉ Must | Rate limits, lockout, CSRF, Helmet |
| **api/overview.md** | ◉ Must | Response envelope, auth headers, pagination pattern |
| **api/auth-endpoints.md** | ◉ Must | Register, login, logout, me, change-password |
| **api/password-endpoints.md** | ◉ Must | Forgot-password, reset-password |
| **api/verification-endpoints.md** | ◉ Must | Verify-email, resend-verification |
| **api/oauth-endpoints.md** | ◉ Must | Google OAuth redirect + callback |
| **api/session-endpoints.md** | ◉ Must | List sessions, revoke session |
| **api/history-endpoints.md** | ◉ Must | Login history with pagination |
| **api/error-codes.md** | ◉ Must | Every error code, HTTP status, when it occurs |
| **guides/adding-custom-fields.md** | ◉ Must | Step-by-step: model → schema → validation → done |
| **guides/custom-email-provider.md** | ◉ Must | Write a SendGrid/SES adapter |
| **guides/custom-database.md** | ○ Optional | Implement repository interfaces for other DBs |
| **guides/extending-middleware.md** | ○ Optional | Insert custom middleware into auth routes |
| **guides/modifying-flows.md** | ○ Optional | Customize service logic |
| **guides/deployment.md** | ◉ Must | Production checklist: env vars, HTTPS, cookie settings |
| **security/overview.md** | ◉ Must | Summary of all security measures |
| **security/password-security.md** | ○ Optional | Deep dive into password hashing |
| **security/session-security.md** | ○ Optional | Deep dive into session security |
| **security/token-security.md** | ○ Optional | Deep dive into token security |
| **security/best-practices.md** | ◉ Must | Production security checklist |

---

## Cross-Linking & Navigation Rules

Every doc follows these conventions:

### 1. Table of Contents
Every [.md](file:///d:/Projects%20FINAL/Web%20Development/Backend%20-%20nodejs/ModularAuth-Kit/README.md) file starts with a `## Table of Contents` using markdown anchor links:
```markdown
## Table of Contents
- [Section One](#section-one)
- [Section Two](#section-two)
  - [Subsection](#subsection)
```

### 2. Navigation Header
Every doc (except README) includes a breadcrumb navigation:
```markdown
[← Back to Index](../README.md) · [Getting Started](../getting-started/quick-start.md) · **Configuration**
```

### 3. Internal Cross-Links
When one doc references a concept from another, it links directly:
```markdown
See the [session configuration](../configuration/sessions.md) for cookie settings.
For details on error codes, see [Error Codes Reference](../api/error-codes.md).
```

### 4. Cross-Folder Links
When user docs reference dev docs (or vice versa), use a clear callout:
```markdown
> 📖 **Developer Note:** For the architectural reasoning behind this choice,
> see [ADR-002: Sessions over JWT](../../dev-docs/decisions/adr-002-sessions-over-jwt.md).
```

### 5. Status Badge (Dev Docs Only)
Dev docs include a status badge at the top:
```markdown
> **Status:** ✅ Current | Last Updated: 2026-03-22
```

---

## Total Count Summary

| Folder | Must Have | Optional | Total |
|---|---|---|---|
| `dev-docs/` | 15 files | 4 files | **19 files** |
| `docs/` | 24 files | 5 files | **29 files** |
| **Total** | **39 files** | **9 files** | **48 files** |

> [!NOTE]
> Docs will be written **incrementally** as each feature is built — not all at once. Each implementation phase includes writing its corresponding documentation.
