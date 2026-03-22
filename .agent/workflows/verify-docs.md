---
description: Verify all documentation is accurate against the source code — use after major changes or before a release
---

# Verify Documentation Accuracy

Systematically check every documentation file against the actual source code.

// turbo-all

## 1. Read Source of Truth

```bash
# Read the actual config defaults
cat src/auth/auth.config.ts
```

```bash
# Read the actual error codes and HTTP status mapping
cat src/auth/auth.constants.ts
```

```bash
# Read the actual dependencies
cat package.json
```

```bash
# Read the actual password hashing implementation
cat src/auth/services/password.service.ts
```

## 2. Check Critical Values

For each item, grep all docs and verify correctness:

### Hashing Algorithm
```bash
grep -rn "bcrypt" docs/ README.md website/
```
Should return ZERO results. The project uses argon2id.

### Express Version
```bash
grep -rn "Express 4" docs/ README.md website/
```
Should return ZERO results. The project uses Express 5.x.

### Mongoose Version
```bash
grep -rn "Mongoose 8" docs/ README.md website/
```
Should return ZERO results if using Mongoose 9.x.

### Default Values
Check these match `auth.config.ts`:
- `idleTimeout` → should be 30 minutes (1,800,000ms)
- `maxAge` → should be 7 days
- `tokenExpiryMinutes` → should be 15 minutes
- `maxFailedAttempts` → should be 5
- `lockDurationMinutes` → should be 15
- `maxSessions` → should be 5

### Error Codes
Compare `auth.constants.ts` ERROR_CODES against `docs/api/error-codes.md`.
Every error code in the source must be in the docs.

### Endpoint Count
Count actual routes in `src/auth/http/routes/` and verify the "16 endpoints" claim.

## 3. Report Findings

List all inaccuracies found and fix them. Then:

```bash
git add -A && git commit -m "Fix documentation inaccuracies found during verification"
```
