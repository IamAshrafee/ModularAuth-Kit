// ============================================================================
// ModularAuth-Kit — Auth Controller
// Thin HTTP controller: parse request → call service → set cookie → respond.
// No business logic here — all logic lives in services.
// See dev-docs/architecture/error-handling.md#controller-layer-catches
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import type { ILoginHistoryRepository, CreateLoginHistoryData } from '../../repositories/interfaces/login-history.repository.interface.js';
import { AuthService } from '../../services/auth.service.js';
import { SessionService } from '../../services/session.service.js';
import { sendSuccess } from '../../utils/api-response.js';
import { handleError } from '../../utils/api-response.js';
import { auditLog } from '../../utils/audit-logger.js';
import { HTTP_STATUS, MESSAGES, LOGIN_EVENTS } from '../../auth.constants.js';
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
  sessionService: SessionService;
  loginHistoryRepository?: ILoginHistoryRepository;
  config: AuthConfig;
}

export function createAuthController(deps: AuthControllerDeps) {
  const { authService, sessionService, loginHistoryRepository, config } = deps;

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
        const userId = user._id.toString();

        if (req.sessionId) {
          await sessionService.revokeById(req.sessionId);
        }
        clearSessionCookie(res, config);

        // Record logout in login history (if enabled)
        if (config.loginHistory.enabled && loginHistoryRepository) {
          const meta = getRequestMeta(req);
          const historyData: CreateLoginHistoryData = {
            userId,
            event: LOGIN_EVENTS.LOGOUT,
            ipAddress: meta.ip,
            userAgent: meta.userAgent,
            device: meta.device,
            success: true,
          };
          await loginHistoryRepository.create(historyData);
        }

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
        const user = getAuthenticatedUser(req);
        const userId = user._id.toString();

        await sessionService.revokeAllByUserId(userId);
        clearSessionCookie(res, config);

        // Record logout-all in login history (if enabled)
        if (config.loginHistory.enabled && loginHistoryRepository) {
          const meta = getRequestMeta(req);
          const historyData: CreateLoginHistoryData = {
            userId,
            event: LOGIN_EVENTS.LOGOUT,
            ipAddress: meta.ip,
            userAgent: meta.userAgent,
            device: meta.device,
            success: true,
            detail: 'logout_all_devices',
          };
          await loginHistoryRepository.create(historyData);
        }

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
