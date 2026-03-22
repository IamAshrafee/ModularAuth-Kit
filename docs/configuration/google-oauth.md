# Google OAuth Configuration

Allow users to log in with their Google account.

## Prerequisites

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services → Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
5. Copy the **Client ID** and **Client Secret**

## Environment Variables

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Enable in Config

```typescript
createConfig({
  login: {
    allowGoogleOAuth: true,
  },
});
```

The `google.clientId`, `google.clientSecret`, and `google.callbackUrl` are automatically populated from the corresponding environment variables.

## How It Works

1. User visits `GET /auth/google`
2. Server generates PKCE (code_verifier + code_challenge) and state
3. Server stores state + verifier in a short-lived httpOnly cookie
4. Server redirects to Google's authorization page
5. User consents → Google redirects to `/auth/google/callback`
6. Server exchanges authorization code for tokens (with PKCE verifier)
7. Server verifies the Google ID token
8. Account resolution: find by `googleId` → find by `email` → create new
9. Session cookie is set → user is redirected to the app

## Security

- **PKCE:** Prevents authorization code interception attacks
- **State parameter:** Prevents CSRF attacks on the OAuth flow
- **ID token verification:** Validates signature, audience, and expiry
- **No Passport.js:** Direct HTTP calls for full transparency (see ADR-004)
