---
description: Performance review — check for slow queries, memory leaks, unnecessary computation, and optimize hot paths
---

# Performance Audit

Review the auth module for performance issues and optimization opportunities.

// turbo-all

## 1. Database Query Analysis

```bash
# Find all database queries
grep -rn "\.find\|\.findOne\|\.findById\|\.updateOne\|\.deleteOne\|\.save\|\.create" src/auth/ --include="*.ts"
```

Check:
- [ ] Queries use indexed fields (email, sessionId, userId)
- [ ] No N+1 query patterns (querying in a loop)
- [ ] `select()` is used to avoid fetching unnecessary fields
- [ ] No `find()` without limits (could return unbounded results)
- [ ] `lean()` is used where Mongoose documents aren't needed

### Index Verification
```bash
# Check model indexes
grep -rn "index\|unique" src/auth/models/ --include="*.ts"
```

Required indexes:
- [ ] `users.email` — unique index
- [ ] `users.username` — unique index (if enabled)
- [ ] `sessions.userId` — for session lookups
- [ ] `sessions.sessionId` — for session validation
- [ ] `loginHistory.userId` — for history queries

## 2. Middleware Overhead

```bash
# List all middleware applied per request
grep -rn "app.use\|router.use\|\.use(" src/auth/ --include="*.ts"
```

Check:
- [ ] Rate limiter only runs on endpoints that need it (not globally)
- [ ] CSRF check only runs on state-changing endpoints (POST/PATCH/DELETE)
- [ ] Session validation is efficient (single DB lookup)
- [ ] No redundant middleware (e.g., double JSON parsing)

## 3. Hashing Performance

```bash
# Check argon2 parameters
grep -rn "argon2\|hash\|verify" src/auth/services/password.service.ts
```

- [ ] Argon2 parameters are balanced (not too high for the server)
- [ ] Password hashing is ONLY done on register and change-password (not on every request)
- [ ] Token hashing uses SHA-256 (fast, appropriate for tokens)

## 4. Memory Analysis

```bash
# Check for potential memory leaks
grep -rn "setInterval\|setTimeout\|addEventListener\|on(" src/auth/ --include="*.ts"
```

- [ ] No uncleaned intervals or timeouts
- [ ] No event listener accumulation
- [ ] Rate limiter stores are bounded (expire old entries)
- [ ] Session cleanup happens (expired sessions are removed)

## 5. Response Size

```bash
# Check what's included in responses
grep -rn "res.json" src/auth/http/controllers/ --include="*.ts"
```

- [ ] No unnecessary data in responses (e.g., full user object when only ID is needed)
- [ ] `passwordHash` is NEVER in responses
- [ ] Pagination is used for list endpoints (login history, sessions)
- [ ] No large embedded objects

## 6. Async Patterns

```bash
# Check for sequential awaits that could be parallel
grep -rn "await.*\nawait" src/auth/services/ --include="*.ts"
```

- [ ] Independent async operations use `Promise.all()` instead of sequential await
- [ ] No blocking operations on the main thread
- [ ] Email sending is fire-and-forget (don't block response for email delivery)

## 7. Report

Categorize findings:

| Issue | Impact | Fix |
|---|---|---|
| Missing index on X | High — slow queries at scale | Add index |
| Sequential awaits in Y | Medium — unnecessary latency | Use Promise.all |
| ... | ... | ... |

Fix high-impact issues:

```bash
git add -A && git commit -m "Optimize performance: [summary of changes]"
```
