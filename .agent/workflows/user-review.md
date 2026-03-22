---
description: Review the project from a user's perspective — evaluate the README, docs, onboarding, and overall impression
---

# User Perspective Review

Review everything a user sees. Think like someone who just found this repo on GitHub and has 2 minutes to decide if they'll use it.

## 1. The 5-Second Test

Open the GitHub repo page. In 5 seconds:
- Do I know what this project does?
- Do I know if it's for me?
- Does it look maintained and professional?
- Would I star it?

## 2. README Scan (30 seconds)

Read the README as fast as possible:
- Is it scannable? (headers, bullet points, not walls of text)
- Does the code example make sense without reading anything else?
- Are the badges/stats credible?
- Is there a clear CTA (call-to-action)?

## 3. Documentation Quality

For each doc page, check:
- [ ] Does the title match the content?
- [ ] Is the first paragraph useful? (not "Welcome to the docs")
- [ ] Are code examples complete and runnable?
- [ ] Are all links working (no 404s)?
- [ ] Is the language clear and professional? (no typos, no jargon without explanation)

```bash
# Check for broken internal links
grep -rn "\[.*\](.*\.md)" docs/ | head -30
```

## 4. Website Review

Open each page of `website/`:
- [ ] Does the hero communicate value in one sentence?
- [ ] Are feature descriptions benefit-focused (not feature-focused)?
- [ ] Does the "Get Started" page actually get you started?
- [ ] Is the docs page useful as a quick reference?
- [ ] Does anything feel "AI-generated" or generic?

## 5. Competitive Comparison

If I'm choosing between ModularAuth-Kit and:
- Rolling my own auth → Why should I use this instead?
- Passport.js → What's the advantage?
- A paid service (Auth0) → What do I lose, what do I gain?

Is this argument clear anywhere in the project? If not, where should it be?

## 6. Trust Signals

What tells me this project is trustworthy?
- [ ] Clear license (MIT)
- [ ] Active commit history
- [ ] Security documentation
- [ ] Author information
- [ ] Professional presentation

What's missing that would increase trust?

## 7. Report

Write a brief "first impressions report":
- **First impression score** (1-10)
- **Would you use it?** (Yes / Maybe / No — with reasons)
- **Top 3 improvements** that would make the biggest difference
- **What's surprisingly good** that should be highlighted more
