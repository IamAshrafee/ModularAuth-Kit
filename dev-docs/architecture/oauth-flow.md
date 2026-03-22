[← Back to Index](../README.md) · [Architecture Overview](overview.md)

> **Status:** ✅ Current | Last Updated: 2026-03-22

# Google OAuth Flow

Step-by-step internals of how Google OAuth 2.0 (Authorization Code with PKCE) works in ModularAuth-Kit.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [The Complete Flow](#the-complete-flow)
  - [Step 1: Initiate (GET /auth/google)](#step-1-initiate)
  - [Step 2: User Consents on Google](#step-2-user-consents-on-google)
  - [Step 3: Callback (GET /auth/google/callback)](#step-3-callback)
  - [Step 4: Account Resolution](#step-4-account-resolution)
- [PKCE (Proof Key for Code Exchange)](#pkce-proof-key-for-code-exchange)
- [State Parameter (CSRF Protection)](#state-parameter-csrf-protection)
- [Account Linking Scenarios](#account-linking-scenarios)
- [ID Token Verification](#id-token-verification)
- [What Data We Get From Google](#what-data-we-get-from-google)
- [Security Considerations](#security-considerations)
- [Configuration](#configuration)

---

## Overview

Google OAuth allows users to log in or register using their Google account. We use the **Authorization Code flow with PKCE** (RFC 7636) — the most secure OAuth flow for server-side applications.

**Key principle:** We do NOT use Passport.js. We make direct HTTP calls to Google's OAuth endpoints. This gives us full control and transparency over every step. See [ADR-004: No Passport.js](../decisions/adr-004-no-passport.md).

---

## Prerequisites

Before Google OAuth can work:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Google+ API" or "People API"
3. Create OAuth 2.0 credentials (Client ID + Client Secret)
4. Add authorized redirect URI: `http://localhost:3000/auth/google/callback` (or your production URL)
5. Set environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
6. Enable the switch: `login.allowGoogleOAuth: true`

---

## The Complete Flow

### Step 1: Initiate

**Endpoint:** `GET /auth/google`

```
Client ── GET /auth/google ──▶ Server

Server:
1. Generate PKCE code_verifier (random 43-128 chars)
2. Compute code_challenge = base64url(SHA-256(code_verifier))
3. Generate random state string (CSRF protection)
4. Store state + code_verifier temporarily:
   - Option A: In a short-lived httpOnly cookie (preferred)
   - Option B: In server memory/cache (with expiry)
5. Build authorization URL:
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=<GOOGLE_CLIENT_ID>
     &redirect_uri=<callback_url>
     &response_type=code
     &scope=openid email profile
     &state=<random_state>
     &code_challenge=<code_challenge>
     &code_challenge_method=S256
     &access_type=offline
     &prompt=consent

6. Redirect client to this URL

◀── 302 Redirect to Google
```

### Step 2: User Consents on Google

This happens entirely on Google's side:
1. User sees Google's consent screen
2. User chooses their Google account
3. User clicks "Allow"
4. Google redirects to our callback URL with `?code=xxx&state=yyy`

### Step 3: Callback

**Endpoint:** `GET /auth/google/callback?code=xxx&state=yyy`

```
Google ── GET /auth/google/callback?code=<auth_code>&state=<state> ──▶ Server

Server:
1. Extract code and state from query parameters
2. Retrieve stored state + code_verifier (from cookie or cache)
3. Verify state matches stored state → if not, abort (CSRF attack)
4. Exchange authorization code for tokens:
   POST https://oauth2.googleapis.com/token
   Body:
     code=<auth_code>
     client_id=<GOOGLE_CLIENT_ID>
     client_secret=<GOOGLE_CLIENT_SECRET>
     redirect_uri=<callback_url>
     grant_type=authorization_code
     code_verifier=<code_verifier>

   Response:
     {
       access_token: "ya29...",
       id_token: "eyJhbG...",      ← This is what we need
       token_type: "Bearer",
       expires_in: 3600,
       refresh_token: "1//..." (if access_type=offline)
     }

5. Verify and decode id_token (see ID Token Verification below)
6. Extract Google profile:
   {
     sub: "1234567890",           ← Google's unique user ID
     email: "user@gmail.com",
     email_verified: true,
     name: "John Doe",
     picture: "https://lh3.googleusercontent.com/...",
     given_name: "John",
     family_name: "Doe"
   }
7. Proceed to Account Resolution (Step 4)
```

### Step 4: Account Resolution

After getting the Google profile, we need to figure out: is this an **existing user** or a **new user**?

```
Got Google profile { sub: googleId, email, name, picture }
       │
       ▼
  ┌─── Find user by googleId ───┐
  │                              │
  │ FOUND                        │ NOT FOUND
  │ (returning Google user)      │
  ▼                              ▼
Login: create session      ┌─── Find user by email ───┐
Return user + cookie        │                           │
                            │ FOUND                     │ NOT FOUND
                            │ (existing email user)     │ (completely new)
                            ▼                           ▼
                      Link Google:               Create new user:
                      user.googleId = sub        {
                      user.avatar = picture        email,
                      user.isEmailVerified = true   googleId: sub,
                      Create session                avatar: picture,
                      Return user + cookie          isEmailVerified: true,
                                                    passwordHash: null
                                                  }
                                                  Create session
                                                  Return user + cookie
```

**Important:** Users who register ONLY via Google have `passwordHash = null`. They cannot log in with email+password until they set a password (via a "set password" flow if you add one).

---

## PKCE (Proof Key for Code Exchange)

PKCE adds an extra layer of security to the OAuth flow, preventing authorization code interception attacks.

```
1. Before redirect:
   code_verifier = crypto.randomBytes(32).toString('base64url')
   code_challenge = base64url(SHA-256(code_verifier))

2. Send code_challenge to Google in the authorization URL

3. On callback, send code_verifier to Google when exchanging the code

4. Google verifies: SHA-256(code_verifier) === code_challenge
   → This proves that the entity exchanging the code is the same one that initiated the flow
```

**Why PKCE?**
- Without PKCE, if an attacker intercepts the authorization code (e.g., via a compromised redirect), they could exchange it for tokens
- With PKCE, the attacker also needs the code_verifier, which was never sent through the redirect
- PKCE is required by OAuth 2.1 (draft) and recommended by OWASP

---

## State Parameter (CSRF Protection)

The `state` parameter prevents CSRF attacks on the OAuth flow:

```
1. Before redirect: Generate random state, store server-side
2. Include state in authorization URL → Google passes it back in callback
3. On callback: verify received state === stored state
4. If mismatch → abort (someone is attempting CSRF)
```

Without state verification, an attacker could:
1. Start an OAuth flow with their own Google account
2. Trick a victim into loading the callback URL
3. Link the attacker's Google account to the victim's session

---

## Account Linking Scenarios

| Scenario | Behavior |
|---|---|
| **New Google user, new email** | Create new user with Google profile, no passwordHash |
| **New Google user, existing email** | Link Google account to existing user (set googleId + avatar, mark email verified) |
| **Returning Google user** | Look up by googleId, create session |
| **Google email ≠ existing email** | Always treated as a new user (different email = different identity) |
| **Google account already linked to another user** | Should not happen (googleId is unique). If it does, error. |

---

## ID Token Verification

The `id_token` returned by Google is a **JWT (JSON Web Token)** signed by Google. We verify it to ensure:

1. **It came from Google** (signature verification)
2. **It was issued for our app** (audience = our client_id)
3. **It hasn't expired** (exp claim)
4. **It was issued recently** (iat claim)

```typescript
// Verification steps:
// 1. Fetch Google's public keys from: https://www.googleapis.com/oauth2/v3/certs
// 2. Decode the JWT header to find the key ID (kid)
// 3. Find the matching public key
// 4. Verify the JWT signature
// 5. Verify claims: iss, aud, exp, iat

// Alternatively (simpler): Use Google's tokeninfo endpoint
// GET https://oauth2.googleapis.com/tokeninfo?id_token=<id_token>
// This is simpler but adds an extra HTTP call
```

---

## What Data We Get From Google

| Field | Type | Description | How We Use It |
|---|---|---|---|
| `sub` | string | Google's unique user ID | Stored as `googleId` for future lookups |
| `email` | string | User's email address | Stored as `email` if new user, matched if existing |
| `email_verified` | boolean | Whether Google has verified this email | We set `isEmailVerified = true` (Google already verified it) |
| `name` | string | User's full name | Stored as `fullName` if the field is enabled |
| `given_name` | string | First name | Stored as `firstName` if the field is enabled |
| `family_name` | string | Last name | Stored as `lastName` if the field is enabled |
| `picture` | string | Profile photo URL | Stored as `avatar` |

---

## Security Considerations

| Threat | Mitigation |
|---|---|
| **CSRF on OAuth callback** | State parameter verification |
| **Authorization code interception** | PKCE (code_verifier/code_challenge) |
| **Fake ID tokens** | Verify JWT signature against Google's public keys |
| **Token replay** | Verify `aud` (audience) matches our client_id |
| **Expired tokens** | Verify `exp` claim |
| **Account hijacking via email** | Google email is only linked if `email_verified: true` from Google |

---

## Configuration

```typescript
// In auth.config.ts
google: {
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '/auth/google/callback',
}
```

**When `login.allowGoogleOAuth` is `false`:**
- OAuth routes (`/auth/google`, `/auth/google/callback`) are **not mounted**
- No Google-related code runs
- The `google` config section is ignored

---

> 📖 **Related Docs:**
> - [ADR-004: No Passport.js](../decisions/adr-004-no-passport.md) — why direct HTTP, not Passport.js
> - [Architecture Overview](overview.md) — Google OAuth data flow
> - [Database Design](database-design.md) — `googleId` field in users collection
