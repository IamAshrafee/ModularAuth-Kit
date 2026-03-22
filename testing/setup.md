[← Back to Index](README.md)

# Postman Testing — Setup Guide

Everything you need to start testing the ModularAuth-Kit APIs with Postman.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [1. Install Postman](#1-install-postman)
- [2. Start the Server](#2-start-the-server)
- [3. Create a Postman Environment](#3-create-a-postman-environment)
- [4. Create the Collection](#4-create-the-collection)
- [5. Cookie Handling in Postman](#5-cookie-handling-in-postman)
- [6. Recommended Request Order](#6-recommended-request-order)
- [Tips & Tricks](#tips--tricks)

---

## Prerequisites

Before testing, make sure you have:

- [x] **Node.js** (v18+) installed
- [x] **MongoDB** running (local or remote)
- [x] **Postman** installed (desktop app recommended)
- [x] Project dependencies installed: `npm install`
- [x] `.env` file configured (copy from `.env.example`)

---

## 1. Install Postman

1. Download Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Install and create a free account (or skip sign-in for local use)
3. Use the **Desktop App** (not web version) — the desktop app handles cookies automatically

---

## 2. Start the Server

```bash
# From the project root
npm run dev
```

Expected output:
```
[AUTH] Connected to MongoDB
[AUTH] Server running on port 3000
[AUTH] Environment: development
```

**Verify the server is running:**
- Open your browser or Postman and visit: `http://localhost:3000/health`
- You should get: `{ "success": true, "message": "OK" }`

---

## 3. Create a Postman Environment

Environments let you store variables (like base URL and session tokens) that all requests can use.

1. In Postman, click **Environments** (left sidebar) → **Create Environment**
2. Name it: `ModularAuth-Kit Local`
3. Add these variables:

| Variable | Type | Initial Value | Description |
|---|---|---|---|
| `base_url` | default | `http://localhost:3000` | Server base URL |
| `auth_prefix` | default | `/auth` | Auth route prefix |
| `test_email` | default | `testuser@example.com` | Test user email |
| `test_password` | default | `MySecure123!` | Test user password |
| `test_username` | default | `testuser` | Test username (if enabled) |
| `session_cookie` | default | *(leave empty)* | Auto-populated by test scripts |
| `reset_token` | default | *(leave empty)* | Auto-populated from console |
| `verification_code` | default | *(leave empty)* | Auto-populated from console |

4. Click **Save**
5. Select this environment from the dropdown in the top-right corner

---

## 4. Create the Collection

1. In Postman, click **Collections** (left sidebar) → **New Collection**
2. Name it: `ModularAuth-Kit`
3. In the collection settings:
   - **Pre-request Script tab:** Leave empty for now
   - **Variables tab:** Leave empty (using environment variables)
4. Create folders inside the collection to match the test docs:
   ```
   ModularAuth-Kit/
   ├── Core Auth/
   │   ├── Register
   │   ├── Login
   │   ├── Get Profile
   │   ├── Update Profile
   │   ├── Change Password
   │   ├── Logout
   │   └── Logout All
   ├── Password Recovery/
   │   ├── Forgot Password
   │   └── Reset Password
   ├── Email Verification/
   │   ├── Verify Email
   │   └── Resend Verification
   ├── Google OAuth/
   │   └── (browser-based — see guide)
   ├── Login History/
   │   └── Get Login History
   ├── Session Management/
   │   ├── List Sessions
   │   └── Revoke Session
   ├── Account Lockout/
   │   └── Lockout Test
   └── Security/
       ├── Rate Limit Test
       ├── Enumeration Test
       └── Security Headers Check
   ```

---

## 5. Cookie Handling in Postman

ModularAuth-Kit uses **HttpOnly cookies** for session management. Postman handles these automatically:

### Automatic Cookie Management (Recommended)
1. Postman Desktop App captures `Set-Cookie` headers from responses
2. Cookies are stored per domain (localhost:3000)
3. Subsequent requests to the same domain automatically include the cookies
4. **You don't need to manually copy/paste session IDs**

### Viewing Cookies
- Click the **Cookies** button (below the Send button) to see stored cookies
- You should see a `sid` cookie after logging in

### Clearing Cookies (for clean testing)
- Click **Cookies** → **localhost** → click the **×** next to the `sid` cookie
- Or delete all cookies for localhost to simulate a logged-out state

### Manual Cookie Override (if needed)
If automatic handling isn't working:
1. In the request's **Headers** tab, add:
   - Key: `Cookie`
   - Value: `sid={{session_cookie}}`
2. After login, copy the `sid` value from the response's `Set-Cookie` header
3. Set it as the `session_cookie` environment variable

---

## 6. Recommended Request Order

For first-time testing, follow this order:

```
1. GET  /health                    → Verify server is running
2. POST /auth/register             → Create a test user
3. POST /auth/login                → Login (cookie set automatically)
4. GET  /auth/me                   → Verify session works
5. PATCH /auth/me                  → Update profile
6. POST /auth/change-password      → Change password
7. POST /auth/logout               → Logout (cookie cleared)
8. POST /auth/login                → Login again with new password
--- Feature-specific tests ---
9. POST /auth/forgot-password      → Test password recovery
10. POST /auth/reset-password      → Complete password reset
11. POST /auth/verify-email        → Verify email
12. GET  /auth/sessions            → View active sessions
13. DELETE /auth/sessions/:id      → Revoke a session
14. GET  /auth/login-history       → View login history
```

---

## Tips & Tricks

### 1. Use Postman Console (for debugging)
- **View** → **Show Postman Console** (or Ctrl+Alt+C)
- Shows full request/response details including headers and cookies

### 2. Auto-Extract Values with Test Scripts
Add this to a request's **Tests** tab to auto-save values:

```javascript
// After Login — save session cookie to environment variable
if (pm.response.headers.has('Set-Cookie')) {
    const cookie = pm.response.headers.get('Set-Cookie');
    const sid = cookie.split('sid=')[1]?.split(';')[0];
    if (sid) {
        pm.environment.set('session_cookie', sid);
    }
}
```

### 3. Quick Error Checking
Add this to the collection-level **Tests** tab to auto-check all responses:

```javascript
// Verify response is JSON
pm.test("Response is JSON", function () {
    pm.response.to.have.header("Content-Type", /json/);
});

// Verify response has correct envelope
pm.test("Has success field", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property('success');
});
```

### 4. Test with Different Configs
To test with different feature switches:
1. Stop the server
2. Modify the config in your app's `createAuthRouter()` call
3. Restart the server
4. Run the relevant tests

### 5. Check Server Console for Tokens
When `passwordRecovery` or `emailVerification` is enabled with the `console` email adapter:
- Password reset tokens appear in the server terminal
- Email verification codes appear in the server terminal
- Copy these values into Postman to complete the test flows

---

> **Next:** Start testing with [Core Auth Tests →](core-auth.md)
