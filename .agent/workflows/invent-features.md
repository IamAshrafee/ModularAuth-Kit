---
description: Brainstorm and evaluate potential new features — think about what's missing, what users would pay for, and what would differentiate the project
---

# Invent New Features

Systematically discover features that should exist but don't yet.

## 1. Listen to the Gaps

Read through existing documentation and find implicit promises that aren't fulfilled:

```bash
# Find "coming soon", "future", "TODO", "planned" mentions
grep -rni "coming soon\|future\|TODO\|planned\|not yet\|will be" docs/ README.md dev-docs/
```

Read `docs/FAQ.md` — every question that starts with "Can I..." or "Does it support..." is a feature request signal.

Read `dev-docs/future-thinking.md` — what's listed but not started?

## 2. Gap Analysis by User Type

Think about who uses this project and what they need that we don't have:

### Solo Developer (side project)
- What's the minimum auth they need?
- What would save them the most time?
- What security features would they skip if they could? (And shouldn't)

### Startup Team (MVP → production)
- What features do they need at launch vs post-launch?
- What would make them choose this over Auth0/Firebase?
- What compliance features do they need? (GDPR, SOC2)

### Enterprise / Agency
- What would stop them from adopting this?
- What customization do they expect?
- What audit/logging features are table stakes?

## 3. Feature Mining from Competitors

Without leaving the codebase, think about what these tools offer that we don't:

| Feature | Passport.js | Auth0 | Firebase Auth | NextAuth | Us? |
|---|---|---|---|---|---|
| Magic links | ❌ | ✅ | ✅ | ✅ | ❌ |
| Passwordless | ❌ | ✅ | ✅ | ❌ | ❌ |
| MFA/TOTP | ❌ | ✅ | ✅ | ❌ | ❌ |
| RBAC | ❌ | ✅ | ✅ | ❌ | ❌ |
| Webhooks | ❌ | ✅ | ✅ | ❌ | ❌ |
| Admin API | ❌ | ✅ | ✅ | ❌ | ❌ |
| Rate limiting | ❌ | ✅ | ✅ | ❌ | ✅ |
| Account linking | ❌ | ✅ | ✅ | ✅ | ✅ |

Which missing features would have the highest impact?

## 4. "10x" Feature Ideas

Think beyond incremental improvements. What feature would make someone tweet about this project?

- **Zero-config magic** — Detect the user's project structure and auto-configure everything
- **Auth health dashboard** — CLI command that shows auth security score, active sessions, failed logins
- **One-click compliance** — Generate GDPR data export, right-to-delete, audit trail with one config flag
- **Auth event webhooks** — Fire HTTP callbacks on login, register, password change (for Slack notifications, analytics, etc.)
- **Passwordless auth** — Magic links sent via email, no password needed
- **Social login builder** — Config-driven social logins: `{ github: true, discord: true, apple: true }`

## 5. Evaluate & Prioritize

For each discovered feature:

| Feature | Who needs it? | Impact (1-5) | Effort (1-5) | Fits our principles? | Priority |
|---|---|---|---|---|---|
| ... | ... | ... | ... | Yes/No | P0-P3 |

A feature only qualifies if:
- ✅ Stays modular (copy one folder)
- ✅ Stays opt-in (disabled by default)
- ✅ Benefits >20% of users
- ✅ Doesn't add required dependencies

## 6. Write Feature Proposals

For the top 3 features, write a brief proposal:

### [Feature Name]
- **What:** One paragraph description
- **Why:** What problem it solves, who needs it
- **How:** High-level implementation approach
- **Config:** What the config option would look like
- **Endpoints:** What new endpoints it would add (if any)
- **Dependencies:** What new packages it would need (if any)

Add approved proposals to `dev-docs/future-thinking.md`.

```bash
git add -A && git commit -m "Add feature proposals from brainstorming session"
```
