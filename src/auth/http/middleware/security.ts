// ============================================================================
// ModularAuth-Kit — Security Middleware
// Sets up Helmet, CSRF protection, and cookie parsing.
// See dev-docs/architecture/error-handling.md
// ============================================================================

import type { RequestHandler, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

import { timingSafeCompare } from '../../utils/crypto.js';

import type { AuthConfig } from '../../auth.types.js';
import { sendError } from '../../utils/api-response.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../../auth.constants.js';

/**
 * Set up security middleware based on config.
 * Returns an array of middleware to apply to the Express app.
 */
export function setupSecurity(config: AuthConfig): RequestHandler[] {
  const middleware: RequestHandler[] = [];

  // Cookie parser — always enabled (needed for session cookies)
  middleware.push(cookieParser(config.session.secret));

  // Helmet — security headers
  if (config.security.helmet) {
    middleware.push(helmet() as RequestHandler);
  }

  // CSRF protection — double-submit cookie pattern
  if (config.security.csrfProtection) {
    middleware.push(csrfProtection(config));
  }

  return middleware;
}

/**
 * Double-submit cookie CSRF protection.
 * Sets a CSRF token cookie on GET requests; validates the token header on mutating requests.
 */
function csrfProtection(config: AuthConfig): RequestHandler {
  const COOKIE_NAME = '_csrf';
  const HEADER_NAME = 'x-csrf-token';
  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

  return (req: Request, res: Response, next: NextFunction): void => {
    // For safe (read-only) methods, set the CSRF cookie if not present
    if (SAFE_METHODS.has(req.method)) {
      if (!req.cookies?.[COOKIE_NAME]) {
        const token = crypto.randomBytes(32).toString('hex');
        res.cookie(COOKIE_NAME, token, {
          httpOnly: false, // JS must read this cookie to send in header
          secure: config.session.secure,
          sameSite: config.session.sameSite,
          path: '/',
        });
      }
      next();
      return;
    }

    // For mutating methods, verify CSRF token
    const cookieToken = req.cookies?.[COOKIE_NAME];
    const headerToken = req.headers[HEADER_NAME] as string | undefined;

    if (!cookieToken || !headerToken || !timingSafeCompare(cookieToken, headerToken)) {
      sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN,
        MESSAGES.FORBIDDEN,
      );
      return;
    }

    next();
  };
}
