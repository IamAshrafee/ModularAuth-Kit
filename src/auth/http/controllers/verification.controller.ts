// ============================================================================
// ModularAuth-Kit — Verification Controller
// Email verification (OTP code) and resend verification endpoints.
// See dev-docs/architecture/token-system.md#email-verification-token
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import type { IUserRepository } from '../../repositories/interfaces/user.repository.interface.js';
import { TokenService } from '../../services/token.service.js';
import { EmailService } from '../../services/email.service.js';
import { AuthError } from '../../errors/auth-error.js';
import { sendSuccess, handleError } from '../../utils/api-response.js';
import { auditLog } from '../../utils/audit-logger.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../../auth.constants.js';
import { getAuthenticatedUser } from '../request-helpers.js';

// ============================================================================
// Controller Factory
// ============================================================================

export interface VerificationControllerDeps {
  tokenService: TokenService;
  emailService: EmailService;
  userRepository: IUserRepository;
  config: AuthConfig;
}

export function createVerificationController(deps: VerificationControllerDeps) {
  const { tokenService, emailService, userRepository, config } = deps;

  return {
    // -----------------------------------------------------------------------
    // POST /auth/verify-email
    // -----------------------------------------------------------------------
    async verifyEmail(req: Request, res: Response): Promise<void> {
      try {
        const { code } = req.body;
        const userId = getAuthenticatedUser(req)._id.toString();

        // Check if already verified
        const user = await userRepository.findById(userId);
        if (user?.isEmailVerified) {
          throw new AuthError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR,
            'Email is already verified',
          );
        }

        // Verify the OTP code
        const tokenDoc = await tokenService.verifyToken(code, 'email_verification');

        // Ensure token belongs to this user
        if (tokenDoc.userId.toString() !== userId) {
          throw new AuthError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.TOKEN_INVALID,
            MESSAGES.TOKEN_INVALID,
          );
        }

        // Mark token as used
        await tokenService.markAsUsed(tokenDoc._id.toString());

        // Set isEmailVerified = true — using dedicated method (no type cast)
        await userRepository.setEmailVerified(userId);

        auditLog('email_verified', { userId, success: true });

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

        // Check if already verified
        const user = await userRepository.findById(userId);
        if (user?.isEmailVerified) {
          throw new AuthError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR,
            'Email is already verified',
          );
        }

        if (!user) {
          throw new AuthError(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.NOT_FOUND,
            'User not found',
          );
        }

        // Generate new verification code (invalidates old ones)
        const code = await tokenService.generateVerificationCode(userId, config);

        // Send verification email
        await emailService.sendVerification(user.email, code, config);

        auditLog('verification_resent', { userId, success: true });

        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.VERIFICATION_RESENT, null);
      } catch (error) {
        handleError(res, error);
      }
    },
  };
}
