// ============================================================================
// ModularAuth-Kit — Auth Controller
// Thin HTTP controller: parse request → call service → set cookie → respond.
// No business logic here — all logic lives in services.
// See dev-docs/architecture/error-handling.md#controller-layer-catches
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig, RequestMeta } from '../../auth.types.js';
import { AuthService } from '../../services/auth.service.js';
import { SessionService } from '../../services/session.service.js';
import { sendSuccess } from '../../utils/api-response.js';
import { handleError } from '../../utils/api-response.js';
import { parseDevice } from '../../utils/device-parser.js';
import { auditLog } from '../../utils/audit-logger.js';
import { HTTP_STATUS, MESSAGES } from '../../auth.constants.js';

// ============================================================================
// Cookie Helpers
// ============================================================================

/**
 * Set the session cookie on the response.
 */
function setSessionCookie(
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
function clearSessionCookie(res: Response, config: AuthConfig): void {
  res.clearCookie(config.session.cookieName, {
    httpOnly: true,
    secure: config.session.secure,
    sameSite: config.session.sameSite,
    path: '/',
  });
}

/**
 * Extract request metadata (IP, User-Agent, device) from the Express request.
 */
function getRequestMeta(req: Request): RequestMeta {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const userAgent = req.headers['user-agent'] ?? 'unknown';
  const device = parseDevice(userAgent);
  return { ip, userAgent, device };
}

// ============================================================================
// Controller Factory
// ============================================================================

export interface AuthControllerDeps {
  authService: AuthService;
  sessionService: SessionService;
  config: AuthConfig;
}

export function createAuthController(deps: AuthControllerDeps) {
  const { authService, sessionService, config } = deps;

  return {
    // -----------------------------------------------------------------------
    // POST /auth/register
    // -----------------------------------------------------------------------
    async register(req: Request, res: Response): Promise<void> {
      try {
        const meta = getRequestMeta(req);
        const result = await authService.register(req.body, meta, config);

        setSessionCookie(res, result.sessionId, config);
        sendSuccess(res, HTTP_STATUS.CREATED, MESSAGES.REGISTER_SUCCESS, {
          user: result.user,
        });
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // POST /auth/login
    // -----------------------------------------------------------------------
    async login(req: Request, res: Response): Promise<void> {
      try {
        const { identifier, password } = req.body;
        const meta = getRequestMeta(req);
        const result = await authService.login(identifier, password, meta, config);

        setSessionCookie(res, result.sessionId, config);
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.LOGIN_SUCCESS, {
          user: result.user,
        });
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // POST /auth/logout
    // -----------------------------------------------------------------------
    async logout(req: Request, res: Response): Promise<void> {
      try {
        const userId = req.user?._id.toString();
        if (req.sessionId) {
          await sessionService.revokeById(req.sessionId);
        }
        clearSessionCookie(res, config);
        auditLog('logout', { userId, ip: req.ip, success: true });
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.LOGOUT_SUCCESS, null);
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // POST /auth/logout-all
    // -----------------------------------------------------------------------
    async logoutAll(req: Request, res: Response): Promise<void> {
      try {
        const userId = req.user?._id.toString();
        if (req.user) {
          await sessionService.revokeAllByUserId(req.user._id.toString());
        }
        clearSessionCookie(res, config);
        auditLog('logout_all', { userId, ip: req.ip, success: true });
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.LOGOUT_SUCCESS, null);
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // GET /auth/me
    // -----------------------------------------------------------------------
    async getProfile(req: Request, res: Response): Promise<void> {
      try {
        const user = await authService.getProfile(req.user!._id.toString());
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PROFILE_FETCHED, { user });
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // PATCH /auth/me
    // -----------------------------------------------------------------------
    async updateProfile(req: Request, res: Response): Promise<void> {
      try {
        const user = await authService.updateProfile(
          req.user!._id.toString(),
          req.body,
          config,
        );
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PROFILE_UPDATED, { user });
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // POST /auth/change-password
    // -----------------------------------------------------------------------
    async changePassword(req: Request, res: Response): Promise<void> {
      try {
        const { currentPassword, newPassword } = req.body;
        const meta: RequestMeta = {
          ip: req.ip ?? 'unknown',
          userAgent: req.get('user-agent') ?? 'unknown',
          device: parseDevice(req.get('user-agent') ?? ''),
        };
        await authService.changePassword(
          req.user!._id.toString(),
          currentPassword,
          newPassword,
          config,
          meta,
        );
        clearSessionCookie(res, config);
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PASSWORD_CHANGED, null);
      } catch (error) {
        handleError(res, error);
      }
    },
  };
}
