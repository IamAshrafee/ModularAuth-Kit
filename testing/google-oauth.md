[← Back to Index](README.md)

# Postman Testing — Google OAuth

Test the Google OAuth login flow.

> **Config required:** `login.allowGoogleOAuth: true` + valid Google Cloud credentials in `.env`
> **Note:** OAuth is a **browser-based** redirect flow — it cannot be fully tested in Postman alone. This guide uses a hybrid approach.

---

## Table of Contents

- [Setup: Google Cloud Credentials](#setup-google-cloud-credentials)
- [1. Test the Redirect](#1-test-the-redirect)
- [2. Complete the Flow (Browser)](#2-complete-the-flow-browser)
- [3. Verify in Postman](#3-verify-in-postman)
- [4. Account Linking Scenarios](#4-account-linking-scenarios)
- [Verification Checklist](#verification-checklist)

---

## Setup: Google Cloud Credentials

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application type)
3. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
4. Copy **Client ID** and **Client Secret** into `.env`
5. Restart the server

---

## 1. Test the Redirect

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{base_url}}{{auth_prefix}}/google` |

> **Important:** In Postman settings, **disable** "Automatically follow redirects" for this request.

**Expected Response — `302 Found`:**
- `Location` header pointing to `https://accounts.google.com/o/oauth2/v2/auth?...`
- URL should contain: `client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`, `code_challenge`

---

## 2. Complete the Flow (Browser)

1. Open your browser and navigate to: `http://localhost:3000/auth/google`
2. You'll be redirected to Google's consent screen
3. Choose your Google account and click "Allow"
4. You'll be redirected back to `http://localhost:3000/auth/google/callback?code=...`
5. The server processes the code and sets a session cookie
6. You should see a success response or be redirected to the app

---

## 3. Verify in Postman

After completing the browser flow, check the database or use Postman:

1. Open your browser DevTools → Application → Cookies → look for `sid`
2. Copy the `sid` value
3. In Postman, set a Cookie header: `Cookie: sid=<value>`
4. `GET /auth/me` → should show your Google account data:

```json
{
  "success": true,
  "data": {
    "user": {
      "email": "your.email@gmail.com",
      "googleId": "1234567890...",
      "avatar": "https://lh3.googleusercontent.com/...",
      "isEmailVerified": true,
      "isActive": true
    }
  }
}
```

---

## 4. Account Linking Scenarios

| Scenario | How to Test | Expected Result |
|---|---|---|
| **New Google user** | Use a Google account not in the DB | New user created with googleId, email, avatar |
| **Existing email** | Register with email/password first, then Google OAuth with same email | googleId linked to existing user |
| **Returning Google user** | OAuth again with same Google account | Existing user found by googleId, session created |

---

## Verification Checklist

| # | Test | Result |
|---|---|---|
| 1 | GET /auth/google → 302 redirect to Google | ⬜ |
| 2 | Redirect URL contains client_id, state, code_challenge | ⬜ |
| 3 | Complete browser flow → Cookie set | ⬜ |
| 4 | GET /auth/me → shows Google user data | ⬜ |
| 5 | isEmailVerified = true (Google verified) | ⬜ |
| 6 | New user: created with googleId + avatar | ⬜ |
| 7 | Existing email: Google linked (not duplicate user) | ⬜ |
| 8 | Returning user: session created (no new user) | ⬜ |

---

> **Next:** [Login History Tests →](login-history.md)
