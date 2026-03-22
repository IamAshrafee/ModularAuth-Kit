[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# ADR-004: Direct OAuth — No Passport.js

## Status
**Accepted**

## Context
For Google OAuth login, we could use **Passport.js** (the de facto auth middleware for Express) or implement the **OAuth flow directly** with HTTP calls to Google's endpoints.

## Decision
We will implement Google OAuth directly using HTTP calls — **no Passport.js**.

## Rationale

| Factor | Direct OAuth ✅ | Passport.js ❌ |
|---|---|---|
| **Transparency** | ✅ Every HTTP call is visible | ❌ Abstraction hides the flow |
| **Control** | ✅ Full control over every step | ❌ Limited by strategy API |
| **Dependencies** | ✅ Zero extra deps (uses built-in `fetch`) | ❌ passport + passport-google-oauth20 + session integration |
| **Session Integration** | ✅ Uses our session system directly | ❌ Expects its own session serialization (`serializeUser`/`deserializeUser`) |
| **PKCE Support** | ✅ We implement it ourselves | ❌ Many strategies don't support PKCE |
| **Debuggability** | ✅ Simple HTTP calls to debug | ❌ Callback chains, strategy internals |
| **Learning** | ✅ Developers see how OAuth actually works | ❌ "Magic" functions hide the flow |

### Key Reasons

**1. We only support one OAuth provider (Google).**
Passport.js excels when you need many OAuth providers (Google, Facebook, GitHub, Twitter, etc.). With a single provider, the abstraction adds complexity without benefit.

**2. Passport.js conflicts with our session system.**
Passport.js has its own session handling (`serializeUser`/`deserializeUser`) that doesn't integrate cleanly with our custom cookie-based sessions. We'd have to fight the framework.

**3. OAuth 2.0 Authorization Code flow is simple.**
The entire flow is 3 HTTP requests:
1. Redirect to Google's authorization URL
2. Exchange authorization code for tokens (POST to Google's token endpoint)
3. Verify the ID token

This is straightforward to implement and test directly.

**4. PKCE is not standard in Passport.js strategies.**
Many Passport.js Google strategies don't support PKCE. We want PKCE for maximum security.

## Consequences
- **Positive:** No dependency overhead, full transparency, PKCE support
- **Positive:** Developers learn how OAuth actually works by reading the code
- **Negative:** If we add more OAuth providers in the future, we'd implement each one manually (or consider Passport.js then)
- **Negative:** Slightly more initial code to write than `passport.use(new GoogleStrategy(...))`

## Alternatives Considered
- **Passport.js:** Rejected — over-abstraction for single provider, session conflicts
- **openid-client:** Considered — good OIDC library, but still an extra dependency for simple flow
- **Grant:** Rejected — less popular, same abstraction concerns

---

> 📖 **Related:** [OAuth Flow](../architecture/oauth-flow.md) — step-by-step implementation details.
