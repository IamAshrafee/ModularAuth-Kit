# Session Management Endpoints

## GET /auth/sessions

List all active sessions for the authenticated user.

**Auth required:** ✅ Yes

**Success (200):**

```json
{
  "success": true,
  "message": "Active sessions retrieved successfully",
  "data": {
    "sessions": [
      {
        "_id": "...",
        "device": {
          "browser": "Chrome",
          "os": "Windows",
          "type": "desktop"
        },
        "ipAddress": "::1",
        "lastActiveAt": "2026-03-22T...",
        "createdAt": "2026-03-22T...",
        "isCurrent": true
      }
    ]
  }
}
```

**Notes:**
- `isCurrent: true` marks the session making the request
- The raw `sessionId` is never exposed

**Example:**

```bash
curl http://localhost:3000/auth/sessions -b cookies.txt
```

---

## DELETE /auth/sessions/:id

Revoke a specific session by its `_id` (not sessionId).

**Auth required:** ✅ Yes

**URL parameter:**

| Param | Description |
|---|---|
| `id` | The `_id` value from the sessions list |

**Success (200):**

```json
{
  "success": true,
  "message": "Session revoked successfully",
  "data": null
}
```

**Errors:**

| Code | Status | When |
|---|---|---|
| `NOT_FOUND` | 404 | Session doesn't exist or belongs to another user |
| `VALIDATION_ERROR` | 400 | Trying to revoke the current session (use /logout) |
| `UNAUTHORIZED` | 401 | No valid session |

**Example:**

```bash
curl -X DELETE http://localhost:3000/auth/sessions/<session-_id> \
  -b cookies.txt
```
