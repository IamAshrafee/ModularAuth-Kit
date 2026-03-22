[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# ADR Template

Use this template when recording a new Architecture Decision Record.

---

## How to Create a New ADR

1. Copy this template
2. Name the file: `adr-NNN-short-description.md` (e.g., `adr-006-redis-caching.md`)
3. Fill in each section
4. Add a link in `dev-docs/README.md`
5. Commit with message: `docs: add ADR-NNN short description`

---

## Template

```markdown
[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: YYYY-MM-DD

# ADR-NNN: Title

## Status
**Proposed** | **Accepted** | **Deprecated** | **Superseded by ADR-XXX**

## Context
What is the issue that we're seeing that is motivating this decision or change?
What technical or business drivers are at play?

## Decision
What is the change that we're proposing and/or doing?

## Rationale
Why was this particular decision made? Include:
- Comparison table (if multiple options were considered)
- Key factors that influenced the decision
- Any measurements or data that supported the choice

## Consequences
What becomes easier or more difficult to do because of this change?
- **Positive:** ...
- **Negative:** ...

## Alternatives Considered
What other options were evaluated and why were they rejected?
```

---

## ADR Status Values

| Status | Meaning |
|---|---|
| **Proposed** | Under discussion, not yet implemented |
| **Accepted** | Agreed upon and implemented |
| **Deprecated** | No longer relevant but kept for historical reference |
| **Superseded by ADR-XXX** | Replaced by a newer decision |
