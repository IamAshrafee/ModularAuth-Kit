// ============================================================================
// ModularAuth-Kit — Auth Controller
// Thin HTTP controller: parse request → call service → set cookie → respond.
// No business logic here — all logic lives in services.
// See dev-docs/architecture/error-handling.md#controller-layer-catches
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import { AuthService } from '../../services/auth.service.js';
import { sendSuccess } from '../../utils/api-response.js';
import { handleError } from '../../utils/api-response.js';
import { HTTP_STATUS, MESSAGES } from '../../auth.constants.js';
import {
  getRequestMeta,
  setSessionCookie,
  clearSessionCookie,
  getAuthenticatedUser,
} from '../request-helpers.js';

// ============================================================================
// Controller Factory
// ============================================================================

export interface AuthControllerDeps {
  authService: AuthService;
  config: AuthConfig;
}

export function createAuthController(deps: AuthControllerDeps) {
  const { authService, config } = deps;

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
        const user = getAuthenticatedUser(req);
        const meta = getRequestMeta(req);

        await authService.logout(user._id.toString(), req.sessionId, meta, config);
        clearSessionCookie(res, config);

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
        const user = getAuthenticatedUser(req);
        const meta = getRequestMeta(req);

        await authService.logoutAll(user._id.toString(), meta, config);
        clearSessionCookie(res, config);

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
        const user = getAuthenticatedUser(req);
        const profile = await authService.getProfile(user._id.toString());
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PROFILE_FETCHED, { user: profile });
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // PATCH /auth/me
    // -----------------------------------------------------------------------
    async updateProfile(req: Request, res: Response): Promise<void> {
      try {
        const user = getAuthenticatedUser(req);
        const updated = await authService.updateProfile(
          user._id.toString(),
          req.body,
          config,
        );
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PROFILE_UPDATED, { user: updated });
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // POST /auth/change-password
    // -----------------------------------------------------------------------
    async changePassword(req: Request, res: Response): Promise<void> {
      try {
        const user = getAuthenticatedUser(req);
        const { currentPassword, newPassword } = req.body;
        const meta = getRequestMeta(req);

        await authService.changePassword(
          user._id.toString(),
          currentPassword,
          newPassword,
          req.sessionId,
          config,
          meta,
        );
        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.PASSWORD_CHANGED, null);
      } catch (error) {
        handleError(res, error);
      }
    },
  };
}
