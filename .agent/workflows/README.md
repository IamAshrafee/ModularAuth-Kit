# ModularAuth-Kit — Workflow Reference

> Workflows are slash commands that guide the AI agent through structured, repeatable processes. Each workflow adopts a specific mindset and follows a defined checklist.

---

## Quick Reference

| Command | Category | One-Line Summary |
|---|---|---|
| `/develop` | Build | Follow the roadmap to implement the next phase |
| `/add-feature` | Build | Plan, implement, test, and document a new feature |
| `/refine-feature` | Build | Improve an existing feature without breaking changes |
| `/update-docs` | Maintain | Sync all docs after a feature change |
| `/update-website` | Maintain | Sync website pages after docs change |
| `/prepare-release` | Release | Verify, build zip, changelog, tag, push |
| `/verify-docs` | Audit | Check all docs accuracy against source code |
| `/security-audit` | Audit | OWASP Top 10, password, sessions, tokens, CSRF |
| `/code-quality-audit` | Audit | TypeScript strictness, patterns, naming, dead code |
| `/dependency-audit` | Audit | Vulnerabilities, outdated, unused deps, licenses |
| `/performance-audit` | Audit | Queries, indexes, memory, hashing, async patterns |
| `/search-potential-bugs-for-future` | Audit | Scan codebase for potential bugs |
| `/dx-review` | Think | Think like a new developer — find setup friction |
| `/project-health-check` | Think | Think like a PM — health, risks, priorities |
| `/architecture-review` | Think | Think like a senior reviewer — structure, smells |
| `/brainstorm` | Think | Creative session — wild ideas, filter, rank |
| `/red-team` | Think | Think like an attacker — break the auth system |
| `/user-review` | Think | Think like a user — README, website, trust |
| `/invent-features` | Think | Discover missing features, evaluate, propose |

---

## When to Use What

### "I just added or changed a feature"

```
/update-docs  →  /update-website  →  /verify-docs
```

This is the most common sequence. After any code change that affects behavior, config, endpoints, or error codes, run these three in order. They ensure everything from the FAQ to the website stays in sync with the source code.

---

### "I want to add a new feature"

```
/add-feature  →  /update-docs  →  /update-website  →  /verify-docs
```

`/add-feature` walks through the full lifecycle: planning, config, implementation (model → repo → service → validation → controller → route), testing, and documentation. Then the maintenance workflows sync everything.

---

### "I want to improve something that already exists"

```
/refine-feature  →  /update-docs  →  /update-website
```

`/refine-feature` emphasizes backwards compatibility — no breaking changes, no removed config options, no changed response shapes. It checks edge cases and makes sure old consumers aren't affected.

---

### "I want to ship a new release"

```
/security-audit  →  /code-quality-audit  →  /dependency-audit  →  /verify-docs  →  /prepare-release
```

Before any release, run the full audit suite. Fix everything found, then `/prepare-release` handles the final verification, changelog, and tagging.

---

### "I want to find problems before they find me"

Pick one or more:

| Worried about... | Run |
|---|---|
| Security vulnerabilities | `/security-audit` + `/red-team` |
| Code quality and tech debt | `/code-quality-audit` + `/architecture-review` |
| Slow performance at scale | `/performance-audit` |
| Outdated or risky dependencies | `/dependency-audit` |
| Documentation lies | `/verify-docs` |
| Hidden bugs | `/search-potential-bugs-for-future` |

---

### "I want to make the project better but don't know where to start"

```
/project-health-check  →  then pick what it recommends
```

This gives you an overall health score and identifies the top 3 priorities. Follow its advice.

Or, for specific perspectives:

| Question | Run |
|---|---|
| "Is this easy to use?" | `/dx-review` |
| "Would users like this?" | `/user-review` |
| "Is the code well-structured?" | `/architecture-review` |
| "What features are we missing?" | `/invent-features` |
| "What wild ideas could help?" | `/brainstorm` |
| "Can someone hack this?" | `/red-team` |

---

### "I want to figure out what to build next"

```
/invent-features  →  /brainstorm  →  /project-health-check
```

Start with `/invent-features` to systematically discover gaps. Use `/brainstorm` for creative 10x ideas. Then `/project-health-check` to prioritize against project goals. The best ideas go into `dev-docs/future-thinking.md`.

---

### "I just want to follow the roadmap"

```
/develop
```

This reads `dev-docs/ROADMAP.md`, finds the next incomplete phase, and implements it following all conventions and patterns.

---

## Workflow Categories Explained

### 🔨 Build Workflows

These workflows **create things** — new features, improvements, or roadmap phases.

| Workflow | When | Why |
|---|---|---|
| `/develop` | Starting a dev session | Follows the roadmap sequentially, implements the next phase |
| `/add-feature` | Feature doesn't exist yet | Full lifecycle from planning to documentation |
| `/refine-feature` | Feature exists but needs improvement | Ensures backwards compatibility while improving behavior |

### 🔧 Maintain Workflows

These workflows **keep things in sync** — they don't change behavior, just documentation and presentation.

| Workflow | When | Why |
|---|---|---|
| `/update-docs` | After any code/feature change | Docs, FAQ, AI prompt, use-cases all reference the code — they must stay accurate |
| `/update-website` | After docs change | The website mirrors docs — feature grid, endpoint tables, code examples |
| `/prepare-release` | Ready to ship a version | Ensures release zip is clean, changelog is written, tag is created |

**Key rule:** Always run `/update-docs` before `/update-website`. Docs are the source of truth for the website.

### 🔍 Audit Workflows

These workflows **find problems** — they check the code against standards and best practices.

| Workflow | What It Checks | Run Frequency |
|---|---|---|
| `/security-audit` | OWASP Top 10, passwords, sessions, tokens, CSRF, rate limits | Before every release |
| `/code-quality-audit` | TypeScript strictness, error handling, naming, dead code, duplication | Monthly or before release |
| `/dependency-audit` | npm vulnerabilities, outdated packages, unused deps, licenses | Monthly |
| `/performance-audit` | Database queries, indexes, middleware overhead, memory, async patterns | Before scaling or on slow reports |
| `/verify-docs` | Every number, default, code example against actual source code | Before every release |
| `/search-potential-bugs-for-future` | Code patterns that could cause bugs under edge conditions | When bored or suspicious |

### 🧠 Think Workflows

These workflows **change your perspective** — they force the AI to think from a specific viewpoint to find things a generic review would miss.

| Workflow | Mindset | Best For |
|---|---|---|
| `/dx-review` | 🧑‍💻 A developer using this for the first time | Finding setup friction, confusing docs, missing context |
| `/project-health-check` | 📋 A project manager prioritizing work | Finding gaps in the user journey, risk assessment, sprint planning |
| `/architecture-review` | 👨‍🏫 A senior engineer doing code review | Finding layering violations, coupling, code smells, inconsistencies |
| `/brainstorm` | 💡 A creative thinker without constraints | Generating wild ideas, then filtering for feasibility |
| `/red-team` | 🏴‍☠️ An attacker trying to break in | Finding exploitable vulnerabilities in auth flows |
| `/user-review` | 👤 A user deciding whether to adopt | Evaluating first impressions, README clarity, trust signals |
| `/invent-features` | 🔬 A product person finding gaps | Discovering missing features through user analysis and competitor comparison |

---

## Common Chains

### After a Change
```
[make code changes]  →  /update-docs  →  /update-website  →  /verify-docs
```

### Full Feature Development
```
/invent-features  →  /add-feature  →  /update-docs  →  /update-website  →  /verify-docs
```

### Pre-Release Audit
```
/security-audit  →  /code-quality-audit  →  /dependency-audit  →  /performance-audit  →  /verify-docs  →  /prepare-release
```

### Deep Quality Review
```
/architecture-review  →  /code-quality-audit  →  /red-team  →  /performance-audit
```

### Strategic Planning Session
```
/project-health-check  →  /invent-features  →  /brainstorm  →  /dx-review  →  /user-review
```

### Monthly Maintenance
```
/dependency-audit  →  /verify-docs  →  /search-potential-bugs-for-future
```

---

## Rules

1. **All workflows use `// turbo-all`** — Commands auto-run without asking for approval each time.
2. **Build workflows commit their work** — Each ends with a commit step.
3. **Audit workflows fix what they find** — Don't just report; fix and commit.
4. **Think workflows produce reports** — They output findings, not code changes (unless quick wins are found).
5. **Maintain workflows are idempotent** — Running them twice produces the same result.

---

*17 workflows · Created for ModularAuth-Kit · [Ashrafee](https://github.com/IamAshrafee)*
