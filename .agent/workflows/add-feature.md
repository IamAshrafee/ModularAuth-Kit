---
description: Add a new feature to the auth module — covers planning, implementation, testing, docs, and website updates
---

# Add New Feature

Step-by-step workflow for adding a new feature to ModularAuth-Kit.

// turbo-all

## 1. Plan the Feature

Before writing any code, answer these:

- **What does this feature do?** (one sentence)
- **Is it opt-in or always-on?** (opt-in is preferred — all optional features are disabled by default)
- **What new endpoints does it add?** (if any)
- **What new config options does it need?** (if any)
- **Does it need new env vars?** (if any)
- **Does it need new dependencies?** (avoid if possible)

Read these files for context:
- `dev-docs/ROADMAP.md` — check if this feature is already planned
- `dev-docs/conventions/coding-standards.md` — naming and patterns to follow
- `dev-docs/conventions/api-response-format.md` — response format to follow
- `dev-docs/architecture/folder-structure.md` — where files go

## 2. Add Config Option

If the feature is opt-in, add the config:

1. **`src/auth/auth.types.ts`** — Add the type definition for the new config section
2. **`src/auth/auth.config.ts`** — Add the default values (disabled by default)
3. **`src/auth/auth.constants.ts`** — Add any new error codes, messages, or defaults

```bash
npx tsc --noEmit  # Verify types are correct
```

## 3. Implement

Follow this order:

1. **Model/Schema** (if new data) — `src/auth/models/`
2. **Repository** (if new data) — `src/auth/repositories/`
3. **Service** (business logic) — `src/auth/services/`
4. **Validation schema** (Zod) — `src/auth/http/validation/`
5. **Controller** (req/res handling) — `src/auth/http/controllers/`
6. **Routes** (endpoint wiring) — `src/auth/http/routes/`
7. **Wire into `index.ts`** — register routes conditionally based on config

Rules:
- Controllers are THIN — only handle req/res, delegate to services
- Services contain ALL business logic
- Never expose `passwordHash` in responses
- Use error codes from `auth.constants.ts`
- Validate ALL input with Zod

```bash
npx tsc --noEmit  # Must be zero errors
```

## 4. Test Manually

```bash
# Start server
npm run dev

# Test the new endpoint(s)
curl -X POST http://localhost:3000/auth/<new-endpoint> \
  -H "Content-Type: application/json" \
  -d '{}' \
  -c cookies.txt -b cookies.txt
```

Verify:
- [ ] Feature works when enabled
- [ ] Feature is invisible when disabled (no routes registered)
- [ ] Error responses follow the standard format
- [ ] Rate limiting is applied (if applicable)
- [ ] Input validation rejects bad data

## 5. Update Everything Else

Run these workflows in order:

1. **`/update-docs`** — Updates all documentation
2. **`/update-website`** — Syncs website pages
3. **`/verify-docs`** — Final accuracy check

## 6. Commit

```bash
git add -A && git commit -m "Add [feature name]

- Added [endpoints/config/model] for [feature]
- Updated docs, website, and AI integration prompt
- Feature is opt-in, disabled by default"
```
