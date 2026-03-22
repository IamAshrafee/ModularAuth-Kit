[← Back to Index](../README.md) · [Architecture Overview](overview.md) · [Database Design](database-design.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Session System

How cookie-based server-side sessions work internally in ModularAuth-Kit.

---

## Table of Contents

- [Overview](#overview)
- [Why Server-Side Sessions](#why-server-side-sessions)
- [Session Lifecycle](#session-lifecycle)
  - [Creation](#creation)
  - [Validation](#validation)
  - [Touch (Activity Update)](#touch-activity-update)
  - [Rotation](#rotation)
  - [Revocation](#revocation)
  - [Expiry](#expiry)
- [Cookie Configuration](#cookie-configuration)
- [Idle Timeout vs Absolute Timeout](#idle-timeout-vs-absolute-timeout)
- [Max Active Sessions](#max-active-sessions)
- [Session Validation Middleware Flow](#session-validation-middleware-flow)
- [Security Considerations](#security-considerations)

---

## Overview

ModularAuth-Kit uses **server-side sessions** with secure cookies. Here's how it works at a high level:

1. User logs in → server creates a session document in the database
2. Server sets a **cookie** containing only the **session ID** (a random string)
3. On every subsequent request, the browser sends the cookie automatically
4. Server reads the session ID from the cookie, looks it up in the database, and identifies the user
5. On logout, the server destroys the session document and clears the cookie

**The cookie never contains user data.** It's just a key to look up the session in the database.

---

## Why Server-Side Sessions

See [ADR-002: Sessions Over JWT](../decisions/adr-002-sessions-over-jwt.md) for the full rationale. Summary:

| Feature | Server-Side Sessions ✅ | JWTs ❌ |
|---|---|---|
| Instant revocation | ✅ Delete session from DB = immediately logged out | ❌ JWT valid until expiry — can't revoke |
| No sensitive data in cookie | ✅ Cookie has only an opaque ID | ❌ JWT contains user data (even if signed) |
| Session management | ✅ Query DB for active sessions, revoke any | ❌ No centralized session list |
| Token size | ✅ ~64 chars (hex session ID) | ❌ ~500+ chars (signed payload) |
| DB hit per request | ❌ Yes, one DB lookup per request | ✅ No DB needed (stateless) |

The DB hit per request is a valid trade-off. For auth systems that need revocation and session management, server-side sessions are the superior choice.

---

## Session Lifecycle

### Creation

**When:** After successful login or registration.

```
1. Generate session ID: crypto.randomBytes(32).toString('hex')  → 64-char hex string
2. Parse device info from User-Agent header
3. Create session document:
   {
     sessionId: <generated>,
     userId: <user's _id>,
     ipAddress: req.ip,
     userAgent: req.headers['user-agent'],
     device: { browser, os, type },
     lastActiveAt: now,
     expiresAt: now + config.session.maxAge,
     createdAt: now
   }
4. Insert session into database
5. Set cookie:
   res.cookie(config.session.cookieName, sessionId, {
     httpOnly: true,
     secure: config.session.secure,
     sameSite: config.session.sameSite,
     maxAge: config.session.maxAge,
     path: '/'
   })
```

### Validation

**When:** Every authenticated request (via `requireAuth` middleware).

```
1. Read session ID from cookie: req.cookies[config.session.cookieName]
2. If no cookie → 401 Unauthorized
3. Query database: find session by sessionId
4. If session not found → clear cookie, 401 Unauthorized
5. If session expired (expiresAt < now) → delete session, clear cookie, 401 Unauthorized
6. If idle timeout exceeded (lastActiveAt + idleTimeout < now) → delete session, clear cookie, 401 Unauthorized
7. Session is valid → fetch user by userId
8. If user not found or isActive === false → delete session, clear cookie, 401 Unauthorized
9. Attach user to request: req.user = user
10. Touch session: update lastActiveAt = now
```

### Touch (Activity Update)

**When:** Every successful session validation.

```
1. After validating a session, update: session.lastActiveAt = now
2. This resets the idle timeout clock
3. Uses a lightweight update: Session.updateOne({ sessionId }, { lastActiveAt: now })
```

**Optimization note:** To avoid a DB write on every single request, we could implement a grace period (e.g., only update if lastActiveAt is more than 1 minute old). This is configurable.

### Rotation

**When:** After a privilege change (login, password change).

Session rotation prevents **session fixation attacks** by issuing a new session ID while keeping the same session data.

```
1. Generate new session ID: crypto.randomBytes(32).toString('hex')
2. Update session document: { sessionId: newSessionId }
3. Set new cookie with new session ID
4. Old session ID is immediately invalid
```

**OWASP recommends** rotating the session ID after:
- Successful authentication (login)
- Changes in privilege level
- Password changes

### Revocation

Sessions can be revoked in three ways:

**Single session (logout):**
```
1. Read session ID from cookie
2. Delete session from database: Session.deleteOne({ sessionId })
3. Clear cookie: res.clearCookie(cookieName)
```

**All user sessions (logout everywhere):**
```
1. Get userId from current session
2. Delete all sessions: Session.deleteMany({ userId })
3. Clear current cookie
```

**Specific session by ID (device management):**
```
1. Authenticated user provides target sessionId
2. Verify target session belongs to the same userId (prevent cross-user revocation)
3. Delete session: Session.deleteOne({ sessionId, userId })
4. If the revoked session is the current session, clear cookie too
```

### Expiry

Two types of expiry work together:

**Automatic (TTL):**
- MongoDB's TTL index on `expiresAt` automatically deletes expired session documents
- Background thread runs every ~60 seconds
- No application code needed

**On-validation:**
- Even if TTL hasn't cleaned up yet, the validation step checks `expiresAt` and `lastActiveAt`
- This catches sessions in the ~60-second window before TTL kicks in

---

## Cookie Configuration

| Setting | Default | Purpose |
|---|---|---|
| `cookieName` | `"sid"` | Cookie name. Avoid default names like `"connect.sid"` that reveal framework. |
| `httpOnly` | `true` (always) | JavaScript cannot read the cookie. Prevents XSS from stealing session IDs. |
| `secure` | `true` (production) | Cookie only sent over HTTPS. Set to `false` for local development. |
| `sameSite` | `"lax"` | Cookie not sent on cross-origin requests (prevents CSRF). `"lax"` allows top-level navigation. |
| `maxAge` | `604800000` (7 days) | Cookie lifetime in milliseconds. Matches session `maxAge`. |
| `path` | `"/"` | Cookie available on all paths. |
| `domain` | not set | Defaults to the current domain. Set explicitly for subdomain sharing. |

---

## Idle Timeout vs Absolute Timeout

ModularAuth-Kit uses **both** timeout strategies as recommended by OWASP:

### Idle Timeout
- **What:** Session expires after a period of **inactivity**
- **Default:** 30 minutes
- **How:** Tracked by `lastActiveAt`. If `now - lastActiveAt > idleTimeout`, session is invalid.
- **Reset:** Every authenticated request updates `lastActiveAt` (touch)
- **Purpose:** Protects against unattended devices

### Absolute Timeout
- **What:** Session expires after a fixed period, **regardless of activity**
- **Default:** 7 days
- **How:** Set at creation in `expiresAt`. Never extended, even if user is active.
- **Purpose:** Limits the total time a potentially compromised session can be used

```
Login ─────────────────────────────────────── Absolute timeout (7 days)
  │
  ├── Request (touch) ── 5 min ── Request (touch) ── 30 min ── IDLE EXPIRED
  │                                                             (no request for 30 min)
  │
  └── Alternatively:
      Request ── Request ── Request ── ... ── continuous activity ── ABSOLUTE EXPIRED
                                                                     (7 days total)
```

---

## Max Active Sessions

When `sessionManagement.maxActiveSessions` is set (e.g., 5):

```
1. User logs in → check active session count for userId
2. If count >= maxActiveSessions:
   a. Find the oldest session (earliest createdAt)
   b. Delete the oldest session
   c. Create the new session
3. Result: user always has at most maxActiveSessions active sessions
```

This prevents session accumulation and provides implicit device management.

---

## Session Validation Middleware Flow

The `authenticate.ts` middleware provides two exports:

### `requireAuth`
Used on protected endpoints. If no valid session, returns 401.

```
requireAuth(req, res, next)
  → read cookie
  → validate session (see Validation above)
  → if invalid → sendError(401, 'UNAUTHORIZED')
  → if valid → req.user = user, next()
```

### `optionalAuth`
Used on endpoints that work for both authenticated and anonymous users.

```
optionalAuth(req, res, next)
  → read cookie
  → if no cookie → req.user = null, next()
  → validate session
  → if invalid → req.user = null, next() (don't error)
  → if valid → req.user = user, next()
```

---

## Security Considerations

| Threat | Mitigation |
|---|---|
| **Session hijacking** (attacker steals session ID) | HttpOnly cookie (no JS access), Secure flag (HTTPS only), SameSite (no cross-origin leak) |
| **Session fixation** (attacker sets a known session ID) | Session rotation after login — new ID generated, old one invalidated |
| **Brute-force session ID** | 256-bit entropy (64 hex chars) — computationally infeasible to guess |
| **Unattended device** | Idle timeout (30 min default) expires inactive sessions |
| **Long-lived compromised session** | Absolute timeout (7 days) limits total session lifetime |
| **Cross-site request forgery (CSRF)** | SameSite cookie + optional CSRF token middleware |

---

> 📖 **Related Docs:**
> - [ADR-002: Sessions Over JWT](../decisions/adr-002-sessions-over-jwt.md) — why we chose this approach
> - [Database Design](database-design.md) — sessions collection schema
> - [Architecture Overview](overview.md) — authenticated request data flow
