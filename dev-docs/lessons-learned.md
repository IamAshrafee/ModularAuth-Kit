# Lessons Learned — Architecture Mistakes to Never Repeat

A living document capturing real mistakes found in this codebase and the principles they teach. Read this before building new features.

---

## 1. Controllers Must Never Import Repositories

**What happened**: `password.controller.ts` and `verification.controller.ts` directly imported `IUserRepository`, `ISessionRepository`, and called them to perform multi-step business logic (validate → hash → update → revoke sessions).

**Why it's bad**: Business logic scattered across layers makes it untestable, un-auditable, and inconsistent. When `SessionService` adds side effects to revocation, the controller path silently misses them.

**Rule**: Controllers call **one service method** and format the response. If a controller has more than one `await service.x()` call, the logic should be in the service.

---

## 2. Don't Bypass Service Layer for "Simple" Operations

**What happened**: `auth.controller.ts` called `loginHistoryRepository.create()` directly instead of `LoginHistoryService.record()`. `password.controller.ts` called `sessionRepository.deleteByUserId()` instead of `SessionService.revokeAllByUserId()`.

**Why it's bad**: Creates invisible second code paths. If the service adds validation, logging, or caching, the bypass path won't get it.

**Rule**: Always go through the service, even for "simple" repository calls. The service is the only authorized caller of its repository.

---

## 3. Use Timing-Safe Comparison for All Security Tokens

**What happened**: CSRF token validation used `===` while OAuth state validation correctly used `timingSafeCompare`. Inconsistent.

**Why it's bad**: Regular `===` leaks timing information that can be exploited for side-channel attacks on short tokens.

**Rule**: Any comparison involving tokens, secrets, or hashes must use `timingSafeCompare` from `crypto.ts`. Never `===`.

---

## 4. structuredClone Before Merging Into Shared Objects

**What happened**: `deepMerge` operated on a shallow copy of `defaultConfig`. Nested objects were shared references, so the merge mutated the singleton for subsequent calls.

**Why it's bad**: If `createConfig()` is called twice (e.g., in tests), the second call sees corrupted defaults from the first.

**Rule**: Always `structuredClone()` before merging into any shared/singleton/default object.

---

## 5. Don't Hardcode What Config Controls

**What happened**: The login history TTL index was hardcoded to 90 days in the Mongoose schema, but `config.loginHistory.retentionDays` let users set a custom value. The config was silently ignored.

**Why it's bad**: Configuration that doesn't work is worse than no configuration — users think they changed behavior but didn't.

**Rule**: If a value is configurable, the consuming code must actually read the config. If infrastructure (like TTL indexes) can't dynamically use config, document the limitation clearly or remove the config option.

---

## 6. Don't Leak Abstractions Through Dependency Wiring

**What happened**: The router factory accepted both `sessionService` AND `sessionRepository`, and both `loginHistoryService` AND `loginHistoryRepository` — 10 fields total. Controllers could pick whichever they wanted.

**Why it's bad**: Encourages controllers to bypass services. Makes the API surface confusing and hard to maintain.

**Rule**: The router/controller layer receives only **services**. Repositories stay inside the module factory (`index.ts`) and services.

---

## 7. Delete Dead Code Immediately

**What happened**: `RateLimitError` class existed but was never instantiated. Rate limiting used `sendError()` directly.

**Why it's bad**: Dead code misleads future developers into thinking it's part of the design. It creates false confidence ("error handling is covered") and maintenance burden.

**Rule**: If you change an approach (e.g., from error classes to direct responses), delete the old approach in the same commit.

---

## 8. DRY Shared Sub-Schemas

**What happened**: The `deviceSchema` Mongoose sub-schema was defined identically in `session.model.ts` and `login-history.model.ts`.

**Why it's bad**: Changing the device field structure requires editing two files and hoping they stay in sync.

**Rule**: Extract shared sub-schemas into their own file (`device.schema.ts`) and import them.

---

## 9. If You Require a Config Value, Use It

**What happened**: `session.secret` was required at startup (throws if missing), loaded from `SESSION_SECRET` env var, but never actually passed to `cookieParser()`. Cookies were unsigned.

**Why it's bad**: Forces users to set an env var that does nothing. Wastes their time debugging why cookie signing "isn't working."

**Rule**: If a config field is required, there must be code that reads it. If there's no consumer, remove the requirement.

---

## Quick Checklist for New Features

Before merging any new feature, verify:

- [ ] Controllers only call services, never repositories
- [ ] All token/secret comparisons use `timingSafeCompare`
- [ ] No shared singletons are mutated (clone first)
- [ ] Every config value has code that reads it
- [ ] No duplicated schemas, types, or helpers
- [ ] No dead/unused classes or functions
- [ ] Router deps include only services, not repositories
