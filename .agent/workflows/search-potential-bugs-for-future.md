---
description: Search for potential bugs in the codebase for future fixing
---

# /search-potential-bugs-for-future

### Steps

1. Read `dev-docs/ROADMAP.md` to understand what has been implemented so far
2. Read `dev-docs/architecture/error-handling.md` for error patterns
3. Search for common bug patterns:
   - Missing `await` on async calls
   - Uncaught promise rejections
   - Missing null checks on repository returns
   - `passwordHash` appearing in any response
   - Missing rate limiting on sensitive endpoints
   - Hardcoded values that should come from config
   - Missing error handling in try/catch blocks
4. Cross-reference with `dev-docs/references/owasp-checklist.md` for security issues
5. Report findings with file paths, line numbers, and severity
