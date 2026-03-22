# Login History Endpoint

## GET /auth/login-history

Retrieve the authenticated user's login history, sorted newest first.

**Auth required:** ✅ Yes

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Entries per page (max 100) |

**Success (200):**

```json
{
  "success": true,
  "message": "Login history retrieved successfully",
  "data": {
    "history": [
      {
        "_id": "...",
        "userId": "...",
        "event": "login_success",
        "ipAddress": "::1",
        "userAgent": "curl/8.17.0",
        "device": {
          "browser": "Unknown",
          "os": "Unknown",
          "type": "desktop"
        },
        "success": true,
        "createdAt": "2026-03-22T..."
      }
    ],
    "page": 1,
    "limit": 20
  }
}
```

**Event types:**

| Event | Description |
|---|---|
| `login_success` | Successful login |
| `login_failure` | Failed login attempt |
| `password_change` | Password changed |
| `logout` | User logged out |

**Example:**

```bash
curl http://localhost:3000/auth/login-history?page=1&limit=10 \
  -b cookies.txt
```
