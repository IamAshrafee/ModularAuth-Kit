# Future Roadmap & Thinking

> ModularAuth-Kit v1 is complete. This document outlines where the project goes next — from tactical improvements to long-term vision.

---

## Guiding Principles

Before adding anything, every idea must pass these filters:

1. **Does it stay modular?** — Users copy one folder. That must never change.
2. **Does it stay opt-in?** — New features disabled by default. Zero bloat.
3. **Does it stay zero-config-first?** — Works with 2 lines of code out of the box.
4. **Does it benefit most users?** — If only 5% need it, it's a plugin, not a core feature.
5. **Does it avoid lock-in?** — Users own the code. No proprietary dependencies.

---

## Near-Term (v1.x Patches)

Small improvements that don't change the API surface.

### Developer Experience
- [ ] **Better error messages at startup** — If `SESSION_SECRET` is missing, show exactly what to do instead of a vague crash
- [ ] **Config validation with Zod** — Validate the entire config object at startup, tell users exactly which option is wrong
- [ ] **TypeScript auto-completion hints** — JSDoc comments on every config option so editors show inline docs
- [ ] **Lightweight CLI helper** — `npx modularauth-kit init` that generates `.env.example` and a starter config snippet. Just a convenience script, not a dependency

### Security Hardening
- [ ] **Password breach checking** — Optional check against HaveIBeenPwned API (k-anonymity, no full password sent)
- [ ] **Login anomaly detection** — Flag logins from new countries/devices, optionally require re-verification
- [ ] **Token rotation** — Refresh tokens with short-lived access tokens for apps that need stateless sessions at the edge
- [ ] **Configurable password rules per-project** — Let users define custom regex rules beyond the built-in policy

### Quality
- [ ] **Automated test suite** — Unit tests for services, integration tests for endpoints (Vitest + Supertest)
- [ ] **CI pipeline** — GitHub Actions: lint, typecheck, test, audit on every PR
- [ ] **100% type coverage** — Eliminate any remaining `any` or loose types

---

## Mid-Term (v2.0)

Features that expand what the module can do, without breaking v1 users.

### Multi-Factor Authentication (MFA)
- [ ] **TOTP support** — Time-based one-time passwords (Google Authenticator, Authy)
- [ ] **Backup codes** — Generate 10 recovery codes on MFA enable
- [ ] **MFA enforcement per-role** — Admins must use MFA, regular users optional
- [ ] **Config:** `mfa: { enabled: true, methods: ['totp'], enforceForRoles: ['admin'] }`

### Role-Based Access Control (RBAC)
- [ ] **Built-in roles** — `user`, `admin`, `moderator` (customizable)
- [ ] **`requireRole('admin')` middleware** — Drop-in route protection
- [ ] **Permission system** — Fine-grained permissions beyond roles (e.g., `users:delete`, `posts:create`)
- [ ] **Config:** `roles: { enabled: true, default: 'user', available: ['user', 'admin'] }`

### More OAuth Providers
- [ ] **GitHub OAuth** — Same pattern as Google, auto-link by email
- [ ] **Discord OAuth** — Popular for community/gaming apps
- [ ] **Apple Sign-In** — Required for iOS apps
- [ ] **Generic OIDC** — Let users plug in any OpenID Connect provider
- [ ] **Config:** `login: { allowGithubOAuth: true, allowDiscordOAuth: true }`

### Account Management
- [ ] **Account deletion** — GDPR-compliant data cleanup (sessions, history, tokens, user)
- [ ] **Email change flow** — Verify new email before switching, invalidate old sessions
- [ ] **Account deactivation** — Soft-delete with reactivation window
- [ ] **Account merge** — Merge OAuth + email accounts for the same person

### API Keys
- [ ] **API key auth** — For server-to-server or third-party integrations
- [ ] **Key scoping** — Each key has specific permissions
- [ ] **Rate limiting per key** — Different limits for different integrations
- [ ] **Config:** `apiKeys: { enabled: true, maxPerUser: 5 }`

---

## Long-Term Vision

### Database-Agnostic Architecture
Currently: MongoDB only. The repository pattern already exists.

- [ ] **PostgreSQL adapter** — Implement repository interfaces with Prisma or Drizzle
- [ ] **SQLite adapter** — For small projects and testing
- [ ] **Redis session store** — Optional high-performance session storage
- [ ] **Adapter selection via config:** `database: { adapter: 'mongodb' | 'postgresql' | 'sqlite' }`

This is the biggest architectural change. The repository interfaces are already defined — it's "just" implementing them for other DBs. But testing and edge cases make it a significant effort.

### Framework Adapters
Currently: Express.js only.

- [ ] **Fastify adapter** — Growing fast, very similar middleware model
- [ ] **Hono adapter** — Lightweight, works on edge runtimes
- [ ] **Framework-agnostic core** — Extract business logic so it works with any HTTP framework

The current architecture couples HTTP handling with Express. A framework-agnostic approach would require:
1. Core layer (services, repositories) — already framework-agnostic
2. HTTP adapter layer — translates framework-specific req/res to a common interface
3. Framework-specific wiring (routing, middleware registration)

### SDK & Client Libraries
- [ ] **`@modularauth/react`** — React hooks: `useAuth()`, `useUser()`, `useSession()`
- [ ] **`@modularauth/next`** — Next.js integration (middleware, server actions)
- [ ] **REST client** — TypeScript client that wraps all 16+ endpoints with proper types

### Plugin Architecture
For features that don't belong in core:

- [ ] **Plugin interface** — `createAuthPlugin({ name, routes, middleware, config })`
- [ ] **Official plugins:** MFA, RBAC, API keys, social logins, admin dashboard
- [ ] **Community plugins:** Custom fields, webhooks, magic links

This would let the core stay lean while enabling an ecosystem.

---

## Ecosystem

### Documentation Site
- [ ] **Deploy website** — GitHub Pages or Vercel (the `website/` folder is ready)
- [ ] **Interactive API playground** — Try endpoints without installing
- [ ] **Video tutorials** — 5-minute setup walkthrough
- [ ] **Blog** — Security best practices, integration guides

### Community
- [ ] **GitHub Discussions** — Q&A and feature requests
- [ ] **Contributing guide** — How to submit PRs, code standards
- [ ] **Issue templates** — Bug reports, feature requests, security reports
- [ ] **Changelog** — Detailed per-version release notes

### Integrations & Templates
- [ ] **Starter templates** — Express + React, Express + Next.js, Express + Vue
- [ ] **Docker compose** — One-command dev environment (Node + MongoDB)
- [ ] **Deployment guides** — Railway, Render, DigitalOcean, AWS

---

## Things Explicitly NOT Planned

To keep the project focused:

- ❌ **User management admin panel** — That's a separate product. ModularAuth-Kit is middleware, not a dashboard.
- ❌ **Built-in frontend** — The module is API-only. Frontend is the user's choice.
- ❌ **Custom database query language** — Use MongoDB/SQL directly through adapters.
- ❌ **Hosted auth service** — This is an open-source library, not a cloud service. No Firebase/Auth0 competitor.
- ❌ **GraphQL support** — REST is the target. GraphQL users can wrap the services.

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---|---|---|---|
| Automated tests | High | Medium | **P0 — Do first** |
| CI pipeline | High | Low | **P0 — Do first** |
| MFA (TOTP) | High | Medium | **P1 — Next** |
| RBAC | High | Medium | **P1 — Next** |
| GitHub/Discord OAuth | Medium | Low | **P1 — Next** |
| Password breach check | Medium | Low | **P1 — Next** |
| Account deletion (GDPR) | Medium | Low | **P1 — Next** |
| PostgreSQL adapter | High | High | **P2 — Later** |
| API keys | Medium | Medium | **P2 — Later** |
| Plugin system | Medium | High | **P2 — Later** |
| Framework adapters | Medium | Very High | **P3 — Future** |
| Client SDKs | Medium | High | **P3 — Future** |

---

## Decision Log

Major decisions to make before v2:

1. **MFA before RBAC, or RBAC first?** — MFA is more universally needed. Ship MFA first.
2. **Roles in user model or separate collection?** — Separate collection is cleaner but adds a join. User model field is simpler for most use cases. **Decision: User model field** (`roles: string[]`), with a separate permissions collection for fine-grained control.
3. **Plugin system architecture** — When does a feature go in core vs plugin? Rule: if >50% of users need it, core. Otherwise, plugin.
4. **PostgreSQL adapter approach** — Prisma? Drizzle? Raw SQL? Depends on type inference needs. Research needed.

---

## How to Contribute

When picking up a feature from this roadmap:

1. Open a GitHub Issue with the feature name
2. Reference this document for context
3. Follow the `/add-feature` workflow
4. Submit a PR with tests

---

*Last updated: 2026-03-22*
*Maintained by: [Ashrafee](https://github.com/IamAshrafee)*
