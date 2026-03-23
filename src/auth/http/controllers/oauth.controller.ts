// ============================================================================
// ModularAuth-Kit — OAuth Controller
// HTTP layer for Google OAuth endpoints (redirect + callback).
// See dev-docs/architecture/oauth-flow.md
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import { OAuthService } from '../../services/oauth.service.js';
import type { OAuthStateData } from '../../services/oauth.service.js';
import { handleError } from '../../utils/api-response.js';
import { auditLog } from '../../utils/audit-logger.js';
import { getRequestMeta, setSessionCookie } from '../request-helpers.js';

// ============================================================================
// Constants
// ============================================================================

/** Cookie name for storing OAuth state + PKCE verifier between redirect and callback */
const OAUTH_STATE_COOKIE = 'oauth_state';

// ============================================================================
// Controller Factory
// ============================================================================

export interface OAuthControllerDeps {
  oauthService: OAuthService;
  config: AuthConfig;
}

export function createOAuthController(deps: OAuthControllerDeps) {
  const { oauthService, config } = deps;

  return {
    // -----------------------------------------------------------------------
    // GET /auth/google — Redirect to Google
    // -----------------------------------------------------------------------
    async redirect(_req: Request, res: Response): Promise<void> {
      try {
        const { url, stateData } = oauthService.getAuthorizationUrl(config);

        // Store state + code_verifier in a short-lived httpOnly cookie
        res.cookie(OAUTH_STATE_COOKIE, JSON.stringify(stateData), {
          httpOnly: true,
          secure: config.session.secure,
          sameSite: 'lax',
          maxAge: 10 * 60 * 1000, // 10 minutes — plenty of time for OAuth flow
          path: '/',
        });

        // Redirect to Google's authorization page
        res.redirect(url);
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // GET /auth/google/callback — Handle Google's redirect back
    // -----------------------------------------------------------------------
    async callback(req: Request, res: Response): Promise<void> {
      try {
        const { code, state, error: oauthError } = req.query as Record<string, string | undefined>;

        // Google returned an error (user denied consent, etc.)
        if (oauthError) {
          res.redirect(`/?error=${encodeURIComponent(oauthError)}`);
          return;
        }

        if (!code || !state) {
          res.redirect('/?error=missing_oauth_params');
          return;
        }

        // Retrieve stored state + code_verifier from cookie
        const rawCookie = req.cookies?.[OAUTH_STATE_COOKIE];
        if (!rawCookie) {
          res.redirect('/?error=oauth_state_expired');
          return;
        }

        // Parse with try-catch — cookie could be corrupted/tampered
        let storedStateData: OAuthStateData;
        try {
          storedStateData = JSON.parse(rawCookie as string) as OAuthStateData;
        } catch {
          res.redirect('/?error=oauth_state_invalid');
          return;
        }

        // Extract request metadata using shared helper
        const meta = getRequestMeta(req);

        // Handle the callback (verify state, exchange code, resolve account)
        const result = await oauthService.handleCallback(
          code,
          state,
          storedStateData,
          meta,
          config,
        );

        // Clear the OAuth state cookie
        res.clearCookie(OAUTH_STATE_COOKIE, { path: '/' });

        // Set session cookie using shared helper
        setSessionCookie(res, result.sessionId, config);

        // Redirect to the app (frontend can read the session cookie)
        res.redirect('/?oauth=success');
      } catch (error) {
        // On error, redirect with error message instead of JSON response
        // (this is a browser redirect flow, not an API call)
        auditLog('oauth_callback_error', {
          success: false,
          detail: error instanceof Error ? error.message : String(error),
        });
        res.redirect('/?error=oauth_failed');
      }
    },
  };
}
