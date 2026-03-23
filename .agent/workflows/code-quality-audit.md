---
description: Audit code quality — checks TypeScript strictness, error handling patterns, code duplication, naming conventions, and dead code
---

# Code Quality Audit

Review the auth module for code quality, consistency, and maintainability.

Read `dev-docs/lessons-learned.md` first — verify none of the documented issues have regressed.

// turbo-all

## 1. TypeScript Strictness

```bash
npx tsc --noEmit
```

Must be zero errors. Then check:

```bash
# Look for any `any` types
grep -rn ": any\|as any" src/auth/ --include="*.ts"
```

- [ ] No `any` types (use proper types or `unknown`)
- [ ] No `@ts-ignore` or `@ts-expect-error` comments
- [ ] All functions have return types

## 2. Error Handling

```bash
# Check for unhandled promises
grep -rn "\.then\|\.catch" src/auth/ --include="*.ts"
```

```bash
# Check for proper try-catch in async functions
grep -rn "async " src/auth/services/ --include="*.ts"
```

- [ ] All async functions have error handling (try-catch or error propagation)
- [ ] Errors use the standard error response format
- [ ] No swallowed errors (empty catch blocks)
- [ ] Error codes from `auth.constants.ts` are used consistently

## 3. Naming Conventions

Read `dev-docs/conventions/coding-standards.md` then check:

```bash
# Check for camelCase in file names (should be kebab-case)
ls -la src/auth/**/*.ts
```

- [ ] File names use kebab-case (e.g., `auth.service.ts` not `authService.ts`)
- [ ] Functions use camelCase
- [ ] Types/interfaces use PascalCase with `I` prefix for interfaces
- [ ] Constants use UPPER_SNAKE_CASE

## 4. Dead Code

```bash
# Find unused exports
grep -rn "export " src/auth/ --include="*.ts" | head -50
```

- [ ] No unused functions or exports
- [ ] No commented-out code blocks
- [ ] No TODO/FIXME comments left unresolved

## 5. Code Duplication

Look for repeated patterns across:
- Controllers — should delegate to services
- Services — should not duplicate logic
- Validation schemas — should share common patterns

- [ ] No copy-pasted code blocks (extract to shared utilities)
- [ ] Controllers are thin (only handle req/res, delegate to services)
- [ ] Services contain all business logic

## 6. Import Organization

```bash
# Check for circular imports
grep -rn "from '\.\." src/auth/ --include="*.ts" | head -30
```

- [ ] No circular imports
- [ ] Imports are organized (external → internal → relative)
- [ ] No unused imports

## 7. API Response Consistency

Read `dev-docs/conventions/api-response-format.md` then:

```bash
grep -rn "res.json\|res.status" src/auth/http/ --include="*.ts"
```

- [ ] All responses use `{ success, message, data }` or `{ success, message, error }` format
- [ ] HTTP status codes are correct (201 for create, 200 for success, 4xx for errors)
- [ ] Error responses include `error.code`

## 8. Report

List issues by category and fix. Then:

```bash
git add -A && git commit -m "Fix code quality issues found during audit"
```
