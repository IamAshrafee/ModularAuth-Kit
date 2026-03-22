[← Back to Index](../README.md) · [Architecture Overview](overview.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Database Design

Complete schema design for all MongoDB collections used by ModularAuth-Kit.

---

## Table of Contents

- [Overview](#overview)
- [Collections](#collections)
  - [users Collection](#users-collection)
  - [sessions Collection](#sessions-collection)
  - [tokens Collection](#tokens-collection)
  - [login_history Collection](#login_history-collection)
- [Index Strategy](#index-strategy)
- [TTL (Auto-Expiry) Strategy](#ttl-auto-expiry-strategy)
- [Relationships](#relationships)
- [Data Lifecycle](#data-lifecycle)

---

## Overview

ModularAuth-Kit uses **4 MongoDB collections**. All collections are created automatically by Mongoose when the auth module initializes.

| Collection | Purpose | Always Active? |
|---|---|---|
| `users` | User accounts | ✅ Yes |
| `sessions` | Active sessions | ✅ Yes |
| `tokens` | Reset & verification tokens | Only when passwordRecovery or emailVerification is enabled |
| `login_history` | Login event records | Only when loginHistory is enabled |

---

## Collections

### `users` Collection

Stores all user accounts. Some fields are conditionally present based on configuration switches.

#### Schema

| Field | Type | Required | Unique | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | yes | MongoDB default primary key |
| `email` | `string` | ✅ always | ✅ yes | User's email address, stored lowercase and trimmed |
| `passwordHash` | `string` | ✅ always* | no | argon2id hash of the user's password. *Not required if user registered via Google OAuth only. |
| `username` | `string` | conditional | ✅ sparse | Only present if `registration.fields.username.enabled`. Stored lowercase, trimmed. Unique sparse index (allows null). |
| `fullName` | `string` | conditional | no | Only present if `registration.fields.fullName.enabled` |
| `firstName` | `string` | conditional | no | Only present if `registration.fields.firstName.enabled` |
| `lastName` | `string` | conditional | no | Only present if `registration.fields.lastName.enabled` |
| `googleId` | `string` | conditional | ✅ sparse | Google's unique user ID. Present only if user linked/registered via Google OAuth. Unique sparse index. |
| `avatar` | `string` | no | no | Profile picture URL from Google (if available) |
| `isEmailVerified` | `boolean` | ✅ always | no | Default: `false`. Set to `true` after email verification, or `true` automatically for Google OAuth users. |
| `isActive` | `boolean` | ✅ always | no | Default: `true`. Can be set to `false` to disable an account without deleting it. |
| `failedLoginAttempts` | `number` | conditional | no | Counter for failed login attempts. Only used if `security.accountLockout.enabled`. Default: `0`. |
| `lockUntil` | `Date` | conditional | no | Timestamp until which the account is locked. Only used if `security.accountLockout.enabled`. |
| `createdAt` | `Date` | ✅ always | no | Mongoose timestamp — when the account was created |
| `updatedAt` | `Date` | ✅ always | no | Mongoose timestamp — when the account was last modified |

#### Indexes

| Index | Fields | Type | Purpose |
|---|---|---|---|
| Primary | `_id` | unique | Default MongoDB |
| Email | `email` | unique | Fast lookup for login, registration uniqueness check |
| Username | `username` | unique sparse | Fast lookup for login by username. Sparse = doesn't index null values. |
| Google ID | `googleId` | unique sparse | Fast lookup for Google OAuth login. Sparse = doesn't index null values. |

#### Notes
- `email` is always stored lowercase: `email.toLowerCase().trim()`
- `username` is always stored lowercase: `username.toLowerCase().trim()`
- The `passwordHash` field is **never** returned in API responses. Excluded via Mongoose `.select('-passwordHash')` or transform.
- The `failedLoginAttempts` and `lockUntil` fields are only present in the schema if account lockout is enabled.

---

### `sessions` Collection

Stores active user sessions. Each session represents one logged-in device/browser.

#### Schema

| Field | Type | Required | Unique | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | yes | MongoDB default primary key |
| `sessionId` | `string` | ✅ yes | ✅ yes | High-entropy random string (64 hex chars). This is the value stored in the cookie. |
| `userId` | `ObjectId` | ✅ yes | no | Reference to `users._id` |
| `ipAddress` | `string` | ✅ yes | no | Client IP address at session creation (or last activity) |
| `userAgent` | `string` | ✅ yes | no | Raw `User-Agent` header string |
| `device` | `object` | ✅ yes | no | Parsed device info (see below) |
| `device.browser` | `string` | yes | no | e.g., "Chrome 120", "Firefox 121" |
| `device.os` | `string` | yes | no | e.g., "Windows 11", "macOS 14", "Android 14" |
| `device.type` | `string` | yes | no | "desktop", "mobile", or "tablet" |
| `lastActiveAt` | `Date` | ✅ yes | no | Updated on every authenticated request (touched). Used for idle timeout. |
| `expiresAt` | `Date` | ✅ yes | no | Absolute expiry time. TTL index auto-deletes the document. |
| `createdAt` | `Date` | ✅ yes | no | When the session was created (i.e., when the user logged in) |

#### Indexes

| Index | Fields | Type | Purpose |
|---|---|---|---|
| Session ID | `sessionId` | unique | Fast session lookup on every authenticated request |
| User ID | `userId` | regular | Find all sessions for a user (for session management, logout-all) |
| Expires At | `expiresAt` | TTL | MongoDB automatically deletes expired sessions |

#### Notes
- `sessionId` is generated with `crypto.randomBytes(32).toString('hex')` — 256 bits of entropy
- The cookie stores `sessionId`, not `_id`
- `expiresAt` is calculated at creation: `new Date(Date.now() + config.session.maxAge)`
- `lastActiveAt` is updated on every authenticated request to track idle time
- TTL index on `expiresAt` means MongoDB garbage-collects expired sessions automatically (checked every ~60 seconds)

---

### `tokens` Collection

Stores password reset and email verification tokens. Tokens are stored as SHA-256 hashes for security.

#### Schema

| Field | Type | Required | Unique | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | yes | MongoDB default primary key |
| `userId` | `ObjectId` | ✅ yes | no | Reference to `users._id` |
| `tokenHash` | `string` | ✅ yes | ✅ yes | SHA-256 hash of the actual token. The raw token is sent to the user; only the hash is stored. |
| `type` | `string` | ✅ yes | no | `"password_reset"` or `"email_verification"` |
| `expiresAt` | `Date` | ✅ yes | no | When this token expires. TTL index auto-deletes. |
| `usedAt` | `Date` | no | no | Set when the token is consumed. Prevents reuse. `null` = unused. |
| `createdAt` | `Date` | ✅ yes | no | When the token was generated |

#### Indexes

| Index | Fields | Type | Purpose |
|---|---|---|---|
| Token Hash | `tokenHash` | unique | Fast lookup when verifying a token |
| User + Type | `userId` + `type` | compound | Find existing tokens for a user (to invalidate old ones before creating new) |
| Expires At | `expiresAt` | TTL | Auto-delete expired tokens |

#### Token Security Model

```
1. Generate raw token:   rawToken = crypto.randomBytes(32).toString('hex')
2. Hash for storage:     tokenHash = SHA-256(rawToken)
3. Store in DB:          { tokenHash, userId, type, expiresAt }
4. Send to user:         email contains rawToken (as URL parameter or OTP)
5. On verification:
   a. Receive rawToken from user
   b. Compute SHA-256(rawToken)
   c. Look up tokenHash in DB
   d. Check: not expired? not used? → valid
   e. Mark as used: set usedAt = now
```

**Why hash tokens?**
If the database is compromised, the attacker gets token hashes — not raw tokens. They can't use the hashes to reset anyone's password or verify any email. The raw tokens are only known to the user (via email).

---

### `login_history` Collection

Records login events for security auditing. Only active when `loginHistory.enabled === true`.

#### Schema

| Field | Type | Required | Unique | Description |
|---|---|---|---|---|
| `_id` | `ObjectId` | auto | yes | MongoDB default primary key |
| `userId` | `ObjectId` | ✅ yes | no | Reference to `users._id` |
| `event` | `string` | ✅ yes | no | Event type (see below) |
| `method` | `string` | no | no | Auth method: `"password"`, `"google"` |
| `ipAddress` | `string` | ✅ yes | no | Client IP address |
| `userAgent` | `string` | ✅ yes | no | Raw `User-Agent` header |
| `device` | `object` | ✅ yes | no | Parsed device info: `{ browser, os, type }` |
| `failureReason` | `string` | no | no | Machine-readable reason for failure events |
| `timestamp` | `Date` | ✅ yes | no | When the event occurred |

#### Event Types

| Event Value | Description |
|---|---|
| `login_success` | Successful login (password or OAuth) |
| `login_failure` | Failed login attempt |
| `logout` | User logged out |
| `password_change` | User changed their password |
| `password_reset` | Password was reset via token |

#### Failure Reasons

| Reason Value | Description |
|---|---|
| `invalid_password` | Password didn't match |
| `user_not_found` | No user with that identifier (logged internally, never exposed to client) |
| `account_locked` | Account was temporarily locked |
| `email_not_verified` | Login blocked due to unverified email |

#### Indexes

| Index | Fields | Type | Purpose |
|---|---|---|---|
| User + Timestamp | `userId` + `timestamp` | compound (desc) | Paginated history queries per user, newest first |
| Timestamp | `timestamp` | TTL | Auto-delete old entries based on retention period |

#### Notes
- `timestamp` TTL is set to `config.loginHistory.retentionDays` (default: 90 days)
- Failure reasons are stored for internal auditing but follow enumeration protection rules — the **API response** to the client is always generic ("Invalid credentials")
- Login history entries are **append-only** — they are never updated, only inserted and eventually auto-deleted

---

## Index Strategy

### Why These Indexes?

| Query Pattern | Required Index | Frequency |
|---|---|---|
| Login: find user by email | `users.email` (unique) | Every login |
| Login: find user by username | `users.username` (unique sparse) | Every login (if username enabled) |
| OAuth: find user by Google ID | `users.googleId` (unique sparse) | Every Google login |
| Auth: validate session | `sessions.sessionId` (unique) | Every authenticated request |
| Logout all: find user sessions | `sessions.userId` | On logout-all, session management |
| Verify token: find by hash | `tokens.tokenHash` (unique) | On password reset, email verification |
| Invalidate old tokens | `tokens.userId + type` (compound) | Before generating new token |
| Login history: paginated query | `login_history.userId + timestamp` | On history page load |

### Performance Notes

- **Unique indexes** also serve as uniqueness constraints — an insert with a duplicate value will throw an error, which our code catches and translates to a `CONFLICT` error.
- **Sparse indexes** (`username`, `googleId`) don't index documents where the field is `null` or missing. This allows multiple users to have no username without violating uniqueness.
- **TTL indexes** offload cleanup to MongoDB — no need for cron jobs to delete expired sessions/tokens.

---

## TTL (Auto-Expiry) Strategy

MongoDB TTL indexes automatically delete documents after a specified time. We use this for self-cleaning collections.

| Collection | TTL Field | Default TTL | Purpose |
|---|---|---|---|
| `sessions` | `expiresAt` | 7 days (from creation) | Auto-cleanup expired sessions |
| `tokens` | `expiresAt` | 15 min (reset) / 10 min (verification) | Auto-cleanup expired tokens |
| `login_history` | `timestamp` | 90 days (configurable) | Auto-cleanup old history entries |

**How TTL works:**
1. On document insert, the TTL field is set to a future date
2. MongoDB runs a background thread every ~60 seconds that checks for expired documents
3. Expired documents are silently removed
4. No application code needed for cleanup

---

## Relationships

```
users
  │
  ├── sessions (1:many) ─── userId references users._id
  │   └── A user can have multiple active sessions (one per device)
  │
  ├── tokens (1:many) ─── userId references users._id
  │   └── A user can have pending reset/verification tokens
  │       (but we invalidate old ones before creating new)
  │
  └── login_history (1:many) ─── userId references users._id
      └── A user has many login events over time
```

**Note:** We do NOT use MongoDB `$lookup` (joins) in normal operations. Each query targets a single collection. This keeps queries fast and simple.

---

## Data Lifecycle

### User Account
```
Register → Create user doc → user persists until manually deleted
                           → isActive can be set to false to "soft delete"
```

### Session
```
Login → Create session → session touched on each request (lastActiveAt updated)
                       → session deleted on logout OR expires via TTL
                       → session deleted on logout-all or revoke
```

### Token
```
Forgot password → Generate token → token lives until:
                                    → used (usedAt set, then TTL cleanup)
                                    → expired (TTL cleanup)
                                    → new token requested (old one invalidated)
```

### Login History Event
```
Login attempt → Insert event → event persists for retentionDays
                              → then auto-deleted by TTL
```

---

> 📖 **Related Docs:**
> - [Session System](session-system.md) — deep dive into session lifecycle
> - [Token System](token-system.md) — deep dive into token security
> - [Architecture Overview](overview.md) — how collections fit into the layer diagram
