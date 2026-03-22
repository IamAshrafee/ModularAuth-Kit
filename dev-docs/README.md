# ModularAuth-Kit — Internal Development Documentation

> **Audience:** Build team members, contributors, and AI agents working on this project.
> **Purpose:** Everything needed to understand how the project is built, why decisions were made, coding conventions, and current progress.

---

## Table of Contents

### 📐 Architecture — *How the system is built*

| Document | Description |
|---|---|
| [System Overview](architecture/overview.md) | Layered architecture, data flow diagrams, component interactions |
| [Folder Structure](architecture/folder-structure.md) | Every folder and file explained with its responsibility |
| [Database Design](architecture/database-design.md) | All collections: fields, types, indexes, TTLs, relationships |
| [Session System](architecture/session-system.md) | Session lifecycle: creation, validation, rotation, expiry, revocation |
| [Token System](architecture/token-system.md) | Token generation, hashing, storage, validation, single-use enforcement |
| [OAuth Flow](architecture/oauth-flow.md) | Google OAuth: redirect → callback → account creation/linking |
| [Config System](architecture/config-system.md) | How feature switches work: route mounting, schema building, service branching |
| [Error Handling](architecture/error-handling.md) | Error class hierarchy, propagation, and formatting |

### 📋 Decisions — *Why things are the way they are*

| Document | Description |
|---|---|
| [ADR-001: Password Hashing](decisions/adr-001-password-hashing.md) | Why argon2id over bcrypt |
| [ADR-002: Sessions Over JWT](decisions/adr-002-sessions-over-jwt.md) | Why cookie-based sessions, not JWTs |
| [ADR-003: Zod Validation](decisions/adr-003-zod-validation.md) | Why Zod over Joi/Yup |
| [ADR-004: No Passport.js](decisions/adr-004-no-passport.md) | Why direct OAuth, not Passport.js |
| [ADR-005: Repository Pattern](decisions/adr-005-repository-pattern.md) | Why repository interfaces for DB flexibility |
| [ADR Template](decisions/adr-template.md) | Template for creating new Architecture Decision Records |

### 📏 Conventions — *How we write code*

| Document | Description |
|---|---|
| [Coding Standards](conventions/coding-standards.md) | Naming rules, file patterns, TypeScript conventions |
| [API Response Format](conventions/api-response-format.md) | The standard response envelope all endpoints must follow |
| [Testing Guidelines](conventions/testing-guidelines.md) | Test patterns, how to run tests, coverage expectations |
| [Documentation Guidelines](conventions/documentation-guidelines.md) | How to write docs consistently across both doc folders |

### 📊 Progress — *Where we are*

| Document | Description |
|---|---|
| [Changelog](progress/changelog.md) | Development changelog — what changed, when |

### 📚 References — *What we consulted*

| Document | Description |
|---|---|
| [OWASP Checklist](references/owasp-checklist.md) | OWASP requirements mapped to our implementation |
| [Dependency Audit](references/dependency-audit.md) | Why each dependency exists, alternatives considered |

---

> 📖 **For kit users** (not building the project, just using it): See the [User Documentation](../docs/README.md).
> 📄 **For project overview:** See the [Project Introduction](../Project_introduction.md).
