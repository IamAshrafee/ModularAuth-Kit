// ============================================================================
// ModularAuth-Kit — Verification Controller
// Thin HTTP layer for email verification endpoints.
// All business logic lives in AuthService.
// See dev-docs/architecture/token-system.md#email-verification-token
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import { AuthService } from '../../services/auth.service.js';
import { sendSuccess, handleError } from '../../utils/api-response.js';
import { HTTP_STATUS, MESSAGES } from '../../auth.constants.js';
import { getAuthenticatedUser } from '../request-helpers.js';

// ============================================================================
// Controller Factory
// ============================================================================

export interface VerificationControllerDeps {
  authService: AuthService;
  config: AuthConfig;
}

export function createVerificationController(deps: VerificationControllerDeps) {
  const { authService, config } = deps;

  return {
    // -----------------------------------------------------------------------
    // POST /auth/verify-email
    // -----------------------------------------------------------------------
    async verifyEmail(req: Request, res: Response): Promise<void> {
      try {
        const { code } = req.body;
        const userId = getAuthenticatedUser(req)._id.toString();

        await authService.verifyEmail(userId, code);

        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.EMAIL_VERIFIED, null);
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // POST /auth/resend-verification
    // -----------------------------------------------------------------------
    async resendVerification(req: Request, res: Response): Promise<void> {
      try {
        const userId = getAuthenticatedUser(req)._id.toString();

        await authService.resendVerification(userId, config);

        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.VERIFICATION_RESENT, null);
      } catch (error) {
        handleError(res, error);
      }
    },
  };
}
