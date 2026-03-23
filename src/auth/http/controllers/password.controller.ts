// ============================================================================
// ModularAuth-Kit — Password Controller
// Thin HTTP layer for forgot-password and reset-password endpoints.
// All business logic lives in AuthService.
// See dev-docs/architecture/token-system.md
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import { AuthService } from '../../services/auth.service.js';
import { sendSuccess, handleError } from '../../utils/api-response.js';
import { HTTP_STATUS, MESSAGES } from '../../auth.constants.js';
import { getRequestMeta } from '../request-helpers.js';

// ============================================================================
// Controller Factory
// ============================================================================

export interface PasswordControllerDeps {
  authService: AuthService;
  config: AuthConfig;
}

export function createPasswordController(deps: PasswordControllerDeps) {
  const { authService, config } = deps;

  return {
    // -----------------------------------------------------------------------
    // POST /auth/forgot-password
    // -----------------------------------------------------------------------
    async forgotPassword(req: Request, res: Response): Promise<void> {
      try {
        const { identifier } = req.body;

        await authService.forgotPassword(identifier, config);

        // Always return 200 (enumeration protection)
        sendSuccess(
          res,
          HTTP_STATUS.OK,
          MESSAGES.FORGOT_PASSWORD_SENT,
          null,
        );
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // POST /auth/reset-password
    // -----------------------------------------------------------------------
    async resetPassword(req: Request, res: Response): Promise<void> {
      try {
        const { token, newPassword } = req.body;
        const meta = getRequestMeta(req);

        await authService.resetPassword(token, newPassword, config, meta);

        sendSuccess(
          res,
          HTTP_STATUS.OK,
          MESSAGES.PASSWORD_RESET_SUCCESS,
          null,
        );
      } catch (error) {
        handleError(res, error);
      }
    },
  };
}
