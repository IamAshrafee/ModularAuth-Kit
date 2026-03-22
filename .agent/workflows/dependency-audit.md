---
description: Audit dependencies — check for vulnerabilities, outdated packages, unnecessary deps, and license compliance
---

# Dependency Audit

Review all project dependencies for security, freshness, and necessity.

// turbo-all

## 1. Security Vulnerabilities

```bash
npm audit
```

- [ ] No critical vulnerabilities
- [ ] No high vulnerabilities
- [ ] Document any medium/low that can't be fixed (explain why)

## 2. Outdated Dependencies

```bash
npm outdated
```

For each outdated package:
- [ ] Check if the update includes breaking changes
- [ ] Update patch/minor versions
- [ ] For major versions, check changelog before updating

## 3. Unnecessary Dependencies

Read `package.json` and check each dependency:

```bash
cat package.json | grep -A 30 '"dependencies"'
```

For each dependency, verify it's actually used:

```bash
# Example: check if argon2 is imported anywhere
grep -rn "argon2" src/auth/ --include="*.ts"
```

- [ ] Every dependency in `dependencies` is actually imported somewhere in `src/auth/`
- [ ] No dev dependencies incorrectly in `dependencies`
- [ ] No duplicate functionality (two libs doing the same thing)

## 4. License Compliance

```bash
npx license-checker --summary 2>/dev/null || echo "Install: npm i -g license-checker"
```

- [ ] No GPL dependencies (incompatible with MIT license)
- [ ] All dependencies use permissive licenses (MIT, Apache-2.0, BSD, ISC)

## 5. Lock File

```bash
# Check lock file is in sync
npm ci --dry-run 2>&1 | head -5
```

- [ ] `package-lock.json` is in sync with `package.json`
- [ ] No phantom dependencies (used but not listed)

## 6. Update Documentation

If any dependencies were updated:
- Update version numbers in `docs/` and `website/` if mentioned
- Run `/verify-docs` workflow to check

```bash
git add -A && git commit -m "Update dependencies — audit results"
```
