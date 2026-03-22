---
description: Think like a project manager — evaluate project health, prioritize work, and identify risks
---

# Project Health Check

Step back from code and evaluate the project as a whole. Think like a PM who needs to decide what to ship next.

## 1. Status Assessment

Answer these questions:
- What is the current state of the project? (MVP, stable, growing, mature?)
- What's the biggest risk to the project right now?
- What's the most common complaint a user would have?
- If we could only ship ONE thing next, what should it be?

## 2. User Journey Gaps

Map the complete user journey and find gaps:

```
Discover → Evaluate → Download → Install → Configure → Use → Scale → Contribute
```

For each stage:
- What does the user need at this stage?
- What do we provide?
- What's missing?

## 3. Competitive Analysis

Without researching externally, think about what alternatives exist:
- Passport.js — How are we different/better?
- Auth0/Firebase Auth — What do they offer that we don't? (And vice versa)
- NextAuth.js — Different target, but what can we learn?
- Custom roll-your-own — Why is our module better than starting from scratch?

Document our unique selling points (USPs) and weaknesses.

## 4. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Security vulnerability found | Medium | Critical | Automated tests, audit workflows |
| Express.js falls out of favor | Low | High | Framework adapter architecture |
| MongoDB version breaks changes | Low | Medium | Pin Mongoose version, test upgrades |
| ... | ... | ... | ... |

Fill in additional risks specific to the current codebase.

## 5. Prioritization

Review `dev-docs/future-thinking.md` and critically evaluate:
- Is the priority order correct?
- Are we missing any high-impact, low-effort wins?
- Are we wasting effort on things nobody asked for?
- What should we stop doing?

## 6. Report

Write a one-page "project health report" with:
- **Overall score** (1-10) with justification
- **Top 3 priorities** for the next sprint
- **Biggest blind spot** — something we're not thinking about
- **Morale check** — is the project exciting? Is it heading in the right direction?
