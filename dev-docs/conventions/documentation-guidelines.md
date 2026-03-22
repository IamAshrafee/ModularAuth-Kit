[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Documentation Guidelines

How to write documentation consistently across both `dev-docs/` and `docs/` folders.

---

## Table of Contents

- [General Principles](#general-principles)
- [Document Structure](#document-structure)
- [Formatting Rules](#formatting-rules)
- [Cross-Linking](#cross-linking)
- [Code Examples](#code-examples)
- [Dev Docs vs User Docs](#dev-docs-vs-user-docs)

---

## General Principles

1. **No placeholders.** Every doc is complete when committed. No "TODO" sections.
2. **Examples for everything.** Config options get examples. API endpoints get request/response examples. Concepts get code snippets.
3. **Why, not just how.** Don't just say "use argon2id" — explain why it was chosen.
4. **AI-readable.** Structured so any AI agent can parse and understand the project immediately.
5. **Keep docs updated.** When code changes, update corresponding docs in the same commit.

---

## Document Structure

Every markdown file follows this structure:

```markdown
[← Back to Index](../README.md) · [Parent Section](link) · **Current Page**

> **Status:** ✅ Current | Last Updated: YYYY-MM-DD

# Title

Brief one-line description of what this document covers.

---

## Table of Contents

- [Section One](#section-one)
- [Section Two](#section-two)

---

## Section One
Content...

---

> 📖 **Related Docs:**
> - [Related Doc](link) — brief description
```

---

## Formatting Rules

| Element | Format | Example |
|---|---|---|
| File names | Backtick code | `auth.config.ts` |
| Function names | Backtick code | `hashPassword()` |
| Config values | Backtick code | `session.maxAge` |
| Key concepts (first use) | **Bold** | **session rotation** |
| Terminal commands | Code block with `bash` | `npm run dev` |
| API endpoints | Code with method | `POST /auth/login` |
| Tables | Markdown tables | For comparisons, options, schemas |

---

## Cross-Linking

- **Within same folder:** `[Doc Name](filename.md)`
- **To parent folder:** `[Doc Name](../filename.md)`
- **Between dev-docs and docs:** `[Doc Name](../../docs/path/to/file.md)` with a callout:
  ```markdown
  > 📖 **Developer Note:** See [ADR-002](../../dev-docs/decisions/adr-002-sessions-over-jwt.md).
  ```

---

## Code Examples

- Use TypeScript syntax highlighting: ` ```typescript `
- Keep examples minimal — show the concept, not the entire file
- Use comments to explain non-obvious parts
- Prefer pseudocode for architectural concepts, real code for implementation details

---

## Dev Docs vs User Docs

| Aspect | `dev-docs/` | `docs/` |
|---|---|---|
| **Audience** | Build team, AI agents | Kit users |
| **Tone** | Technical, detailed, "why" focused | Practical, "how to" focused |
| **Code examples** | Internal implementation | Public API usage |
| **Status badge** | ✅ Required at top | ❌ Not needed |
| **ADRs** | Yes — document decisions | No — just state what to do |

---

> 📖 **Related Docs:**
> - [Coding Standards](coding-standards.md) — code comment conventions
