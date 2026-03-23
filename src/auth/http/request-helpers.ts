// ============================================================================
// ModularAuth-Kit — HTTP Request Helpers
// Shared utilities for controllers: request metadata extraction, cookie
// management, and authenticated user guard.
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig, RequestMeta, UserDocument } from '../auth.types.js';
import { AuthError } from '../errors/auth-error.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../auth.constants.js';
import { parseDevice } from '../utils/device-parser.js';

// ============================================================================
// Request Metadata
// ============================================================================

/**
 * Extract request metadata (IP, User-Agent, device) from the Express request.
 */
export function getRequestMeta(req: Request): RequestMeta {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const userAgent = req.headers['user-agent'] ?? 'unknown';
  const device = parseDevice(userAgent);
  return { ip, userAgent, device };
}

// ============================================================================
// Cookie Helpers
// ============================================================================

/**
 * Set the session cookie on the response.
 */
export function setSessionCookie(
  res: Response,
  sessionId: string,
  config: AuthConfig,
): void {
  res.cookie(config.session.cookieName, sessionId, {
    httpOnly: true,
    secure: config.session.secure,
    sameSite: config.session.sameSite,
    maxAge: config.session.maxAge,
    path: '/',
  });
}

/**
 * Clear the session cookie from the response.
 */
export function clearSessionCookie(res: Response, config: AuthConfig): void {
  res.clearCookie(config.session.cookieName, {
    httpOnly: true,
    secure: config.session.secure,
    sameSite: config.session.sameSite,
    path: '/',
  });
}

// ============================================================================
// Auth Guard
// ============================================================================

/**
 * Get the authenticated user from the request, or throw 401.
 * Replaces non-null assertions (req.user!) with a runtime-safe guard.
 * Use in routes protected by requireAuth middleware.
 */
export function getAuthenticatedUser(req: Request): UserDocument {
  if (!req.user) {
    throw new AuthError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED,
      MESSAGES.UNAUTHORIZED,
    );
  }
  return req.user;
}
