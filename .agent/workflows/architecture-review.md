---
description: Think like a senior code reviewer — find architectural issues, anti-patterns, inconsistencies, and improvement opportunities
---

# Architecture Review

Review the codebase as a harsh but fair senior engineer. Look for things that "work" but aren't "right."

## 1. Layering Violations

Check the architecture boundaries:

```
Routes → Controllers → Services → Repositories → Database
```

- [ ] Controllers never import repositories directly (must go through services)
- [ ] Services never import Express types (`req`, `res`, `next`)
- [ ] Repositories never contain business logic (only data access)
- [ ] No circular dependencies between layers

```bash
# Check for layer violations
grep -rn "import.*from.*repository" src/auth/http/ --include="*.ts"
grep -rn "import.*express" src/auth/services/ --include="*.ts"
grep -rn "import.*from.*controller" src/auth/services/ --include="*.ts"
```

## 2. Consistency Audit

Scan for inconsistent patterns:

- [ ] All controllers follow the same error handling pattern (try-catch vs error propagation)
- [ ] All services use the same dependency injection pattern
- [ ] All validation schemas follow the same naming convention
- [ ] All config options follow the same enable/disable pattern
- [ ] All error messages use the same tone and format

```bash
# Check controller patterns
grep -rn "try {" src/auth/http/controllers/ --include="*.ts"
grep -rn "catch" src/auth/http/controllers/ --include="*.ts"
```

## 3. Design Pattern Review

For each pattern used, ask: "Is this the right pattern? Is it applied consistently?"

- **Repository pattern** — Is the abstraction useful? Does it add value over using Mongoose directly?
- **Adapter pattern** — Are email/database adapters truly interchangeable?
- **Config-driven feature flags** — Is the config object getting too complex? Too many nested levels?
- **Middleware chain** — Is the middleware order correct? Are there redundant checks?

## 4. Coupling Analysis

What would break if you changed:
- The User model schema? → How many files need updating?
- The session storage mechanism? → Is it truly abstracted?
- The error response format? → How many places define the shape?
- The cookie name? → Is it centralized or scattered?

High coupling = high risk. Document the worst offenders.

## 5. Edge Cases Nobody Tests

Walk through these scenarios mentally:
- What happens if MongoDB goes down mid-request?
- What happens if two users register with the same email at the exact same time?
- What happens if a session cookie has the right format but an expired/deleted session?
- What happens if the argon2 native module fails to load?
- What happens if `SESSION_SECRET` is changed while sessions exist?
- What happens when the server restarts — do sessions survive?

## 6. "Code Smells"

Look for:
- Functions longer than 50 lines
- Files longer than 300 lines
- More than 3 levels of nesting
- God objects (one class/service doing too much)
- Primitive obsession (passing raw strings instead of typed objects)
- Feature envy (one service spending more time with another service's data)

```bash
# Find long files
wc -l src/auth/**/*.ts | sort -rn | head -10
```

## 7. Report

Write a review as if submitting PR feedback:
- **Architecture issues** — Structural problems to fix
- **Inconsistencies** — Things that need alignment
- **Improvement suggestions** — "This works, but X would be better because..."
- **Strengths** — What's well-designed (positive feedback matters)
