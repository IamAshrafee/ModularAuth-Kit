---
description: Prepare a new release — verify docs accuracy, build release zip contents list, create changelog entry
---

# Prepare Release

Run this workflow before creating a new GitHub Release.

// turbo-all

## 1. Verify Docs Match Source Code

Cross-check these critical values against source:

```bash
# Check hashing algorithm
grep -r "argon2" src/auth/services/password.service.ts

# Check default config values
cat src/auth/auth.config.ts | head -100

# Check error codes
cat src/auth/auth.constants.ts

# Check dependencies
cat package.json | grep -A 20 '"dependencies"'
```

Verify these in documentation:
- [ ] Hashing algorithm is listed as argon2id (not bcrypt)
- [ ] Express version matches package.json
- [ ] Mongoose version matches package.json
- [ ] Session idleTimeout default is 30 minutes
- [ ] Token expiry default is 15 minutes
- [ ] All error codes from auth.constants.ts are in docs/api/error-codes.md
- [ ] Endpoint count is accurate on website and README

## 2. Run TypeScript Check

```bash
npx tsc --noEmit
```

Must be zero errors.

## 3. List Release Files

The release zip should contain ONLY:
```
ModularAuth-Kit/
├── src/auth/          ← The module
├── docs/              ← Documentation
├── README.md
├── .env.example
├── package.json
└── tsconfig.json
```

Do NOT include: `.agents/`, `.agent/`, `dev-docs/`, `testing/`, `website/`, `node_modules/`, `.env`, `.git/`, `RULES.md`, `Project_introduction.md`, `documentation_structure.md`, `skills-lock.json`, `package-lock.json`

## 4. Update Changelog

Add a new entry to `dev-docs/progress/changelog.md` with:
- Version number
- Date
- What changed (features, fixes, docs)

## 5. Commit & Tag

```bash
git add -A
git commit -m "Prepare release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

## 6. Remind User

Tell the user to:
1. Create the release zip with only the files listed above
2. Go to GitHub → Releases → Create New Release
3. Select the tag, write release notes, upload the zip
