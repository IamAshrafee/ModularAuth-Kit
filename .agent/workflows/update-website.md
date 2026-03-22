---
description: Update the website after changes to features, docs, or configuration
---

# Update Website

Run this after the documentation has been updated to sync the website pages.

// turbo-all

## 1. Determine What Changed

Read the recent git diff to understand what documentation was updated:

```bash
git diff HEAD~1 --name-only
```

## 2. Update Affected Pages

### If features/endpoints changed:
- `website/index.html` — Update feature grid cards, endpoint count in stats, "How It Works" section
- `website/features.html` — Update feature detail section, endpoint listing

### If config options changed:
- `website/docs.html` — Update config tables (Registration, Login, Sessions, Security)
- `website/getting-started.html` — Update code examples in all 3 tabs

### If error codes changed:
- `website/docs.html` — Update error codes table

### If security details changed:
- `website/docs.html` — Update security sections (Passwords, Sessions, Tokens)

### If dependencies changed:
- `website/index.html` — Update tech badges section
- `website/getting-started.html` — Update npm install commands in all tabs
- `website/docs.html` — Update installation section

## 3. Verify Code Examples

Every code example on the website must be valid. Check:
- Import paths are correct (e.g., `./auth/index.js`)
- Config options match the actual TypeScript types
- Endpoint paths match the actual routes

## 4. Commit

```bash
git add -A && git commit -m "Sync website with updated documentation"
```
