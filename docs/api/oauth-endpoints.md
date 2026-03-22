# OAuth Endpoints

## GET /auth/google

Initiates Google OAuth login. Redirects the browser to Google's consent page.

**Auth required:** No

**How to use:** Navigate to this URL in a browser (not curl):
```
http://localhost:3000/auth/google
```

**Flow:**
1. Server generates PKCE challenge + state, stores in cookie
2. Server redirects to Google's authorization page
3. User consents on Google
4. Google redirects back to `/auth/google/callback`

---

## GET /auth/google/callback

Handles Google's redirect after user consent. **Not called directly** — Google calls this.

**Query parameters (set by Google):**

| Param | Description |
|---|---|
| `code` | Authorization code |
| `state` | CSRF protection state |

**On success:**
- Sets `sid` session cookie
- Redirects to `/?oauth=success`

**On error:**
- Redirects to `/?error=<reason>`

**Possible error values:**

| Error | Meaning |
|---|---|
| `access_denied` | User denied consent |
| `missing_oauth_params` | Missing code or state |
| `oauth_state_expired` | State cookie expired |
| `oauth_failed` | Token exchange or account creation failed |

---

## Account Resolution

When a Google user authenticates, the system resolves their account:

| Scenario | Action |
|---|---|
| Google ID already linked | Login (create session) |
| Email exists, no Google ID | Link Google to existing account |
| No matching user | Create new user (no password) |
