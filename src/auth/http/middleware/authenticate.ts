// ============================================================================
// ModularAuth-Kit — Authentication Middleware
// Validates sessions and attaches user to the request.
// See dev-docs/architecture/session-system.md#session-validation-middleware-flow
// ============================================================================

import type { Request, Response, NextFunction } from 'express';

import type { AuthConfig, UserDocument } from '../../auth.types.js';
import { SessionService } from '../../services/session.service.js';
import { AuthError } from '../../errors/auth-error.js';
import { sendError } from '../../utils/api-response.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../../auth.constants.js';

// ============================================================================
// Extend Express Request type
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      sessionId?: string;
    }
  }
}

// ============================================================================
// Factory — creates middleware bound to the session service and config
// ============================================================================

/**
 * Create the requireAuth middleware.
 * Reads the session cookie, validates the session, and attaches user to req.
 * Returns 401 if no valid session.
 */
export function createRequireAuth(
  sessionService: SessionService,
  config: AuthConfig,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = req.cookies?.[config.session.cookieName];

      if (!sessionId) {
        sendError(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED,
          MESSAGES.UNAUTHORIZED,
        );
        return;
      }

      const { session: _session, user } = await sessionService.validate(sessionId, config);

      req.user = user;
      req.sessionId = sessionId;
      next();
    } catch (error) {
      if (error instanceof AuthError) {
        // Clear invalid cookie
        res.clearCookie(config.session.cookieName);
        sendError(res, error.statusCode, error.code, error.message, error.details);
        return;
      }
      next(error);
    }
  };
}

/**
 * Create the optionalAuth middleware.
 * Same as requireAuth but doesn't fail — sets req.user = undefined and continues.
 */
export function createOptionalAuth(
  sessionService: SessionService,
  config: AuthConfig,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sessionId = req.cookies?.[config.session.cookieName];

      if (!sessionId) {
        next();
        return;
      }

      const { session: _session, user } = await sessionService.validate(sessionId, config);

      req.user = user;
      req.sessionId = sessionId;
      next();
    } catch {
      // On any error, just continue without user — don't fail
      next();
    }
  };
}
