[← Back to Index](README.md)

# Postman Testing — Session/Device Management

Test active session listing and remote session revocation.

> **Config required:** `sessionManagement.enabled: true`

---

## Table of Contents

- [1. Create Multiple Sessions](#1-create-multiple-sessions)
- [2. List Active Sessions](#2-list-active-sessions)
- [3. Revoke a Specific Session](#3-revoke-a-specific-session)
- [4. Max Active Sessions](#4-max-active-sessions)
- [Verification Checklist](#verification-checklist)

---

## 1. Create Multiple Sessions

To test session management, create sessions with different user-agents:

**Session 1 — Default Postman:**
Login normally.

**Session 2 — Simulate mobile browser:**
Add custom header: `User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15`
Login again (in a new Postman tab/request without cookies).

**Session 3 — Simulate Chrome:**
Add custom header: `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0`
Login again.

> **Tip:** Save the `sid` cookie from each login response for later testing.

---

## 2. List Active Sessions

| Field | Value |
|---|---|
| Method | `GET` |
| URL | `{{base_url}}{{auth_prefix}}/sessions` |
| Auth | Cookie (logged in with any session) |

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Active sessions retrieved",
  "data": {
    "sessions": [
      {
        "sessionId": "abc123...",
        "device": {
          "browser": "PostmanRuntime 7.36",
          "os": "Other",
          "type": "desktop"
        },
        "ipAddress": "127.0.0.1",
        "lastActiveAt": "2026-03-22T07:50:00.000Z",
        "createdAt": "2026-03-22T07:30:00.000Z",
        "isCurrent": true
      },
      {
        "sessionId": "def456...",
        "device": {
          "browser": "Mobile Safari 17.0",
          "os": "iOS 17.0",
          "type": "mobile"
        },
        "ipAddress": "127.0.0.1",
        "lastActiveAt": "...",
        "createdAt": "...",
        "isCurrent": false
      }
    ],
    "total": 3
  }
}
```

**Check:**
- [ ] `isCurrent: true` marks the session making this request
- [ ] Device info correctly parsed from different user-agents
- [ ] All sessions for this user are listed

---

## 3. Revoke a Specific Session

Pick a session ID that is NOT the current one.

| Field | Value |
|---|---|
| Method | `DELETE` |
| URL | `{{base_url}}{{auth_prefix}}/sessions/<sessionId-to-revoke>` |
| Auth | Cookie (logged in with a DIFFERENT session) |

**Expected Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Session revoked",
  "data": null
}
```

**After revoking:**
- [ ] `GET /auth/sessions` shows one fewer session
- [ ] Using the revoked session's cookie for `GET /auth/me` → 401

---

## 4. Max Active Sessions

> **Config:** Set `sessionManagement.maxActiveSessions: 2`

1. Login (session 1)
2. Login with different user-agent (session 2)
3. Login with another user-agent (session 3)

**Expected:** Session 1 (oldest) is automatically revoked. Only sessions 2 and 3 remain.

---

## Verification Checklist

| # | Test | Result |
|---|---|---|
| 1 | Multiple logins create multiple sessions | ⬜ |
| 2 | List sessions shows all with device info | ⬜ |
| 3 | Current session marked with `isCurrent: true` | ⬜ |
| 4 | Revoke other session → 200, session invalidated | ⬜ |
| 5 | Revoked session cookie → 401 on /me | ⬜ |
| 6 | Max sessions: oldest evicted when limit exceeded | ⬜ |
| 7 | Cannot revoke another user's session | ⬜ |
| 8 | Disabled feature → 404 | ⬜ |

---

> **Next:** [Account Lockout Tests →](account-lockout.md)
