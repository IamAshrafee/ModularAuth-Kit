---
description: Develop the next phase of ModularAuth-Kit following the roadmap
---

# /develop — Implement Next Roadmap Phase

// turbo-all

## Steps

### 1. Read Current Progress
Read the roadmap to determine which phase is next:
```
Read: dev-docs/ROADMAP.md
```
Find the first phase with `[ ]` (not started) or `[/]` (in progress). That's the current phase.

### 2. Read Phase Dependencies
Read all files listed in the phase's **Depends On** section. These provide the context and patterns to follow.

### 3. Read Architecture & Convention Docs
Read the linked dev-docs for the current phase (architecture docs, ADRs, conventions). Follow these patterns exactly.

### 4. Implement the Code
Create/modify the files listed in the phase. Follow:
- `dev-docs/conventions/coding-standards.md` for naming, imports, patterns
- `dev-docs/conventions/api-response-format.md` for response structures
- `dev-docs/architecture/folder-structure.md` for file locations

### 5. Type-Check
```bash
npx tsc --noEmit
```
Fix any TypeScript errors before proceeding. Zero errors required.

### 6. Run Verification
Execute the phase's **Verification** section. For Phase 9+, this includes starting the server and testing endpoints:
```bash
npm run dev
```
Run all listed curl commands or verification steps.

### 7. Write User-Facing Docs
Create the files listed in the phase's **User Docs to Write** section. Follow `dev-docs/conventions/documentation-guidelines.md`.

### 8. Cross-Check Testing Docs
Read the `testing/` files listed in the phase's **Testing Docs to Cross-Check** section.
- Run through each checklist item against the real running code
- Update any response bodies, status codes, error messages, or field names that differ
- Mark checklist items ✅ only after confirming they match

### 9. Update Roadmap Status
In `dev-docs/ROADMAP.md`, change the current phase from `[ ]` to `[x]`.

### 10. Commit
```bash
git add -A
git commit -m "Phase N: <phase title>

- <bullet point summary of what was created>
- <bullet point summary of what was modified>
- Verified: <verification method>"
```

### 11. Report
Summarize what was done, any issues encountered, and confirm the phase is complete.
