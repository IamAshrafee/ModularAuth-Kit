[← Back to Index](../README.md) · [Architecture Overview](overview.md) · [Database Design](database-design.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Token System

How password reset and email verification tokens work internally.

---

## Table of Contents

- [Overview](#overview)
- [Security Model](#security-model)
- [Token Types](#token-types)
- [Token Lifecycle](#token-lifecycle)
  - [Password Reset Token](#password-reset-token)
  - [Email Verification Token](#email-verification-token)
- [Token Generation](#token-generation)
- [Token Storage (Hashing)](#token-storage-hashing)
- [Token Verification](#token-verification)
- [Single-Use Enforcement](#single-use-enforcement)
- [Token Invalidation](#token-invalidation)
- [Expiry & Cleanup](#expiry--cleanup)
- [Security Considerations](#security-considerations)

---

## Overview

Tokens are short-lived, single-use, cryptographically secure strings used for two purposes:

1. **Password Reset** — sent to the user's email to prove they own the email before allowing a password change
2. **Email Verification** — sent to the user's email to prove the email address is valid

**The core security principle:** We never store the raw token in the database. We store a **SHA-256 hash** of the token. The raw token is only known to the user (via their email).

---

## Security Model

```
┌──────────────┐     rawToken      ┌──────────────┐
│  Application │ ─── (via email) ──▶│     User     │
│              │                    │              │
│  Stores:     │                    │  Receives:   │
│  SHA-256     │                    │  rawToken    │
│  hash ONLY   │                    │  (in email)  │
└──────────────┘                    └──────────────┘

On verification:
1. User sends rawToken back to the application
2. Application computes SHA-256(rawToken)
3. Application looks up the hash in the database
4. If found + not expired + not used → token is valid
```

**Why hash?**
- If the database is leaked, the attacker gets hashes — not raw tokens
- Hashes can't be reversed to get the raw token
- The attacker can't use the hashes to reset passwords or verify emails
- This is the same principle used for password storage, but with SHA-256 (fast hash is fine here because tokens have high entropy and are short-lived)

---

## Token Types

| Type | Value | Config Switch | Default Expiry | Purpose |
|---|---|---|---|---|
| Password Reset | `"password_reset"` | `passwordRecovery.enabled` | 15 minutes | Allow user to set a new password |
| Email Verification | `"email_verification"` | `emailVerification.enabled` | 10 minutes | Verify user owns the email address |

---

## Token Lifecycle

### Password Reset Token

```
User clicks "Forgot Password"
       │
       ▼
POST /auth/forgot-password { email }
       │
       ▼
  ┌─── Does user exist? ───┐
  │                         │
  │ YES                     │ NO
  │                         │
  ▼                         ▼
Invalidate old             Return 200 anyway
reset tokens               (enumeration protection)
  │
  ▼
Generate rawToken (32 bytes hex)
  │
  ▼
Hash: tokenHash = SHA-256(rawToken)
  │
  ▼
Store in DB: { tokenHash, userId, type: "password_reset", expiresAt }
  │
  ▼
Send rawToken to user's email (as part of reset URL)
  │
  ▼
Return 200 "If an account exists, we've sent a reset email"

--- Later ---

User clicks reset link with rawToken
       │
       ▼
POST /auth/reset-password { token: rawToken, newPassword }
       │
       ▼
Compute SHA-256(rawToken)
       │
       ▼
Find token by tokenHash in DB
       │
       ▼
  ┌─── Valid? ───┐
  │              │
  │ Not found     │ Found + not expired + not used
  │ or expired    │
  │ or used       │
  │              │
  ▼              ▼
Return error    Hash newPassword with argon2id
                Update user's passwordHash
                Mark token as used (usedAt = now)
                Revoke all sessions (force re-login)
                Return 200
```

### Email Verification Token

```
User registers (or clicks "Resend Verification")
       │
       ▼
Generate 6-digit OTP code (configurable length)
       │
       ▼
Hash: tokenHash = SHA-256(otpCode)
       │
       ▼
Store in DB: { tokenHash, userId, type: "email_verification", expiresAt }
       │
       ▼
Send OTP code to user's email
       │
       ▼
Return 200 / 201

--- Later ---

User submits OTP code
       │
       ▼
POST /auth/verify-email { code: otpCode }
       │
       ▼
Compute SHA-256(otpCode)
       │
       ▼
Find token by tokenHash + userId + type in DB
       │
       ▼
  ┌─── Valid? ───┐
  │              │
  │ Invalid      │ Valid
  │              │
  ▼              ▼
Return error    Set user.isEmailVerified = true
                Mark token as used
                Return 200
```

---

## Token Generation

### Password Reset Token
```typescript
// 32 bytes = 256 bits of entropy → 64-char hex string
const rawToken = crypto.randomBytes(32).toString('hex');
// Example: "a3f8c1d2e4b5a6f7c8d9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
```

### Email Verification OTP
```typescript
// Generate N-digit numeric code (default: 6 digits)
const code = crypto.randomInt(100000, 999999).toString();
// Example: "847293"
```

**Why different formats?**
- Reset tokens go in URLs (email links) — hex strings work well in URLs
- Verification codes are typed manually by users — short numeric codes are user-friendly

---

## Token Storage (Hashing)

```typescript
import { createHash } from 'crypto';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
```

**Why SHA-256 (not argon2id)?**
- Tokens already have **high entropy** (256 bits for reset, 6+ digits for OTP)
- SHA-256 is a fast hash — this is fine because brute-forcing 256-bit random data is computationally impossible
- argon2id is designed for **low-entropy** inputs (human passwords) where slow hashing is needed to prevent dictionary attacks
- SHA-256 is the standard choice for high-entropy token storage (used by GitHub, Stripe, and other major platforms)

---

## Token Verification

```typescript
function verifyToken(rawToken: string, type: string): TokenDocument | null {
  // 1. Hash the raw token
  const tokenHash = hashToken(rawToken);

  // 2. Look up in database
  const tokenDoc = await tokenRepository.findByHash(tokenHash);

  // 3. Validate
  if (!tokenDoc) return null;                    // Token not found
  if (tokenDoc.type !== type) return null;       // Wrong type
  if (tokenDoc.expiresAt < new Date()) return null; // Expired
  if (tokenDoc.usedAt !== null) return null;     // Already used

  return tokenDoc; // Valid
}
```

---

## Single-Use Enforcement

Tokens are designed to be used exactly once:

```typescript
// After successful verification:
await tokenRepository.markAsUsed(tokenDoc._id);
// This sets: { usedAt: new Date() }
```

**Why single-use?**
- Prevents replay attacks — if someone intercepts the token, they can't use it after the legitimate user already has
- Reset links should work once and only once
- Verification codes should work once and only once

---

## Token Invalidation

When a user requests a new token, we **invalidate all existing tokens** of the same type for that user:

```typescript
// Before creating a new reset token:
await tokenRepository.invalidateByUserAndType(userId, 'password_reset');
// This deletes all existing password_reset tokens for this user
```

**Why?**
- Prevents confusion from multiple valid tokens
- Prevents attackers from requesting many tokens and trying them all
- Only the most recent token should be valid

---

## Expiry & Cleanup

| Token Type | Default Expiry | Configurable? |
|---|---|---|
| Password Reset | 15 minutes | Yes: `passwordRecovery.tokenExpiryMinutes` |
| Email Verification | 10 minutes | Yes: `emailVerification.codeExpiryMinutes` |

**Expiry enforcement happens at two levels:**

1. **Application level:** Verification step checks `expiresAt < now` before accepting
2. **Database level:** TTL index on `expiresAt` auto-deletes expired tokens (within ~60 seconds)

---

## Security Considerations

| Threat | Mitigation |
|---|---|
| **Database leak** | Only hashes stored — raw tokens can't be recovered |
| **Token guessing** | 256-bit entropy (reset) — computationally infeasible. 6-digit OTP is protected by rate limiting. |
| **Replay attack** | Single-use enforcement — token marked as used after first verification |
| **Old token reuse** | New token request invalidates all previous tokens of same type |
| **Timing attack** | Token lookup uses hash comparison (not string comparison) and returns in constant time for hit/miss |
| **Token in URL** | Reset tokens in URLs may be logged in server logs. We use POST body for verification, not GET parameters. Reset emails contain a link that loads a form, not a direct reset URL. |
| **Long-lived tokens** | Short expiry (10–15 min) plus TTL cleanup |

---

> 📖 **Related Docs:**
> - [Database Design](database-design.md) — tokens collection schema
> - [Architecture Overview](overview.md) — forgot password data flow
> - [OWASP Checklist](../references/owasp-checklist.md) — token security requirements
