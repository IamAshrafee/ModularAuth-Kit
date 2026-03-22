---
description: Run after adding/modifying a feature or endpoint to update all related documentation, website, and AI integration docs
---

# After Feature Update

When you add, modify, or remove a feature or endpoint in the auth module, run through this checklist to keep everything in sync.

// turbo-all

## 1. Identify What Changed

Read the modified source files and determine:
- Was an endpoint added, removed, or changed?
- Was a config option added or changed?
- Was an error code added?
- Was a dependency added or removed?

## 2. Update Documentation

Check and update each of these files if affected:

### Core Docs
- `docs/api/auth-endpoints.md` — if endpoints changed
- `docs/api/error-codes.md` — if new error codes were added
- `docs/api/overview.md` — if response format changed
- `docs/configuration/*.md` — if config options changed (match the right file)
- `docs/security/*.md` — if security behavior changed
- `docs/guides/*.md` — if integration patterns changed

### FAQ
- `docs/FAQ.md` — add/update questions if the change affects common user workflows

### Use Case Scenarios
- `docs/use-cases/express-rest-api.md`
- `docs/use-cases/ecommerce-backend.md`
- `docs/use-cases/saas-app.md`
- `docs/use-cases/blog-platform.md`
- `docs/use-cases/minimal-setup.md`

Only update the ones relevant to the feature changed.

## 3. Update AI Integration Docs

- `docs/ai-integration/agent-prompt.md` — update config builder reference, dependency list, or verification steps if affected
- `docs/ai-integration/context.md` — update endpoint list, config reference, or architecture description if affected

## 4. Update Website

- `website/index.html` — update feature grid, stats, or code examples if affected
- `website/features.html` — update feature details or endpoint listing
- `website/docs.html` — update API table, config tables, or error codes table
- `website/getting-started.html` — update code examples if config API changed

## 5. Update README

- `README.md` — update Quick Start code if config API changed, update feature list, update endpoint count
- `docs/README.md` — update index if new doc pages were added

## 6. Verify Accuracy

```bash
# Ensure TypeScript still compiles
npx tsc --noEmit

# Grep for outdated references
# Example: if you renamed an endpoint, search for the old name
```

Cross-check every number, default value, and code example against the actual source code.

## 7. Commit

```bash
git add -A && git commit -m "Update docs/website for [feature name] changes"
```
