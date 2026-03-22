# ModularAuth-Kit — AI Agent Rules

These rules apply to all AI agents working on this project.

## Context Loading (ALWAYS DO FIRST)
1. **Always read `dev-docs/ROADMAP.md` first** when starting any development work. Identify the current phase before writing any code.
2. **Always read the relevant architecture docs** linked in the current phase's "Depends On" section before implementing.

## Code Quality
3. **Always run `npx tsc --noEmit` after writing TypeScript files.** Zero errors required before moving on. Fix all type errors immediately.
4. **Follow `dev-docs/conventions/coding-standards.md`** for all naming, imports, patterns, and prohibited practices. No exceptions.
5. **Follow `dev-docs/conventions/api-response-format.md`** for every API response. Always use `sendSuccess()` and `sendError()` helpers — never call `res.json()` directly.
6. **Check `dev-docs/architecture/folder-structure.md`** when creating new files to ensure correct location and naming.

## Security (Non-negotiable)
7. **Never expose `passwordHash` in any API response.** If a query returns user data, ensure the passwordHash field is excluded.
8. **Use identical error messages for auth failures** — same message for "user not found" and "wrong password" to prevent account enumeration.
9. **Follow `dev-docs/references/owasp-checklist.md`** for all security-related decisions.

## Testing & Documentation
10. **Cross-check `testing/` docs after implementing each phase.** Update any response examples that don't match the real code.
11. **Write user-facing docs (`docs/`) alongside implementation**, not after. Each phase specifies which docs to write.
