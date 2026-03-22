[← Back to Index](../README.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# ADR-002: Server-Side Sessions Over JWT

## Status
**Accepted**

## Context
We need to choose how to manage user authentication state after login. The two main approaches are **server-side sessions** (session ID in cookie, session data in database) and **JWTs** (signed token containing user data, stored client-side).

## Decision
We will use **cookie-based server-side sessions** as the primary authentication mechanism.

## Rationale

| Factor | Server-Side Sessions ✅ | JWTs ❌ |
|---|---|---|
| **Instant Revocation** | ✅ Delete from DB = immediately invalid | ❌ Valid until expiry — cannot revoke |
| **Logout from Device** | ✅ Delete specific session | ❌ Requires token blacklist (defeats stateless purpose) |
| **Session Management** | ✅ Query DB for all active sessions | ❌ No centralized session list |
| **Sensitive Data Exposure** | ✅ Cookie has opaque ID only | ❌ Payload visible (even if signed) |
| **Token Size** | ✅ ~64 chars | ❌ 500+ chars (grows with claims) |
| **CSRF Protection** | ✅ SameSite cookie (built-in) | Mixed — depends on storage |
| **DB Hit per Request** | ❌ One read per request | ✅ Stateless (no DB needed) |
| **Complexity** | ✅ Simple — store/lookup/delete | ❌ Refresh token rotation, blacklists, etc. |

### Key Reasons

**1. Revocation is non-negotiable.**
We need "logout from device" and "logout everywhere" features. JWTs cannot be revoked without a server-side blacklist — which makes them effectively server-side sessions but more complex.

**2. Session management requires server state.**
We need to list active sessions, show device info, and let users revoke specific sessions. This requires storing sessions server-side.

**3. No advantage of JWTs in our use case.**
JWTs shine in distributed microservice architectures where services need to verify identity without hitting a central auth server. In a monolithic REST API (our use case), there's no such benefit.

**4. Cookie security is simpler.**
HttpOnly + Secure + SameSite cookies are well-understood and handle most browser-based security concerns automatically.

## Consequences
- **Positive:** Instant session revocation, full session management, simpler implementation
- **Positive:** No sensitive data in cookies, no refresh token complexity
- **Negative:** Every authenticated request hits the database (one read)
- **Negative:** Not suitable for cross-domain microservice auth (not our use case)

### Mitigating the DB Hit
A single `findOne({ sessionId })` on an indexed field is extremely fast (<1ms on local MongoDB, <5ms on remote). For high-traffic scenarios, a Redis cache layer could be added in front of MongoDB.

## Alternatives Considered
- **JWTs with refresh tokens:** Rejected due to revocation complexity and no session management
- **JWTs with server-side blacklist:** Rejected — essentially reinvents sessions with more complexity
- **Hybrid (JWT for short-term, sessions for long-term):** Rejected — unnecessary complexity for our use case

---

> 📖 **Related:** [Session System](../architecture/session-system.md) — full implementation details.
