---
description: Refine an existing feature — improve behavior, fix edge cases, enhance UX without breaking the API
---

# Refine Feature

Improve an existing feature without breaking backwards compatibility.

// turbo-all

## 1. Understand Current Behavior

```bash
# Read the current implementation
cat src/auth/services/<relevant-service>.ts
```

```bash
# Read the current config defaults
grep -A 20 "<feature-name>" src/auth/auth.config.ts
```

Document:
- Current behavior
- What's being changed and why
- Any edge cases to handle

## 2. Check Backwards Compatibility

Before making changes, verify:

- [ ] No existing config options are removed (deprecate instead)
- [ ] No endpoint paths are changed
- [ ] No response shapes are changed (can ADD fields, not remove)
- [ ] No error codes are changed (can ADD, not rename)
- [ ] Default behavior stays the same (existing users shouldn't notice)

## 3. Make Changes

1. Update the service layer (business logic)
2. Update validation schemas if input changes
3. Update types if config options are added
4. Update config defaults for new options

```bash
npx tsc --noEmit  # Must be zero errors
```

## 4. Test Edge Cases

Test both the happy path AND edge cases:
- [ ] Feature works with default config
- [ ] Feature works with custom config
- [ ] Feature handles invalid input gracefully
- [ ] Feature works when related features are disabled
- [ ] Old API consumers aren't broken

```bash
npm run dev
# Run curl tests for affected endpoints
```

## 5. Update Documentation

Only update docs that are affected by the refinement:

```bash
# Find docs that mention the feature
grep -rn "<feature-keyword>" docs/ README.md website/
```

Update each result if the behavior described has changed.

## 6. Commit

```bash
git add -A && git commit -m "Refine [feature name]: [what changed]

- [Specific improvement]
- Backwards compatible — no breaking changes
- Updated affected documentation"
```
