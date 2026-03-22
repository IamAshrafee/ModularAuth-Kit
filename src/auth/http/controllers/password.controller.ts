// ============================================================================
// ModularAuth-Kit — Password Controller
// Forgot password and reset password endpoints.
// See dev-docs/architecture/token-system.md
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import type { IUserRepository } from '../../repositories/interfaces/user.repository.interface.js';
import type { ISessionRepository } from '../../repositories/interfaces/session.repository.interface.js';
import { TokenService } from '../../services/token.service.js';
import { EmailService } from '../../services/email.service.js';
import * as passwordService from '../../services/password.service.js';
import { sendSuccess, handleError } from '../../utils/api-response.js';
import { auditLog } from '../../utils/audit-logger.js';
import { HTTP_STATUS, MESSAGES } from '../../auth.constants.js';

// ============================================================================
// Controller Factory
// ============================================================================

export interface PasswordControllerDeps {
  tokenService: TokenService;
  emailService: EmailService;
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
  config: AuthConfig;
}

export function createPasswordController(deps: PasswordControllerDeps) {
  const { tokenService, emailService, userRepository, sessionRepository, config } = deps;

  return {
    // -----------------------------------------------------------------------
    // POST /auth/forgot-password
    // -----------------------------------------------------------------------
    async forgotPassword(req: Request, res: Response): Promise<void> {
      try {
        const { identifier } = req.body;

        // Find user by email or username
        let user = await userRepository.findByEmail(identifier);

        if (!user && config.passwordRecovery.identifiedBy !== 'email') {
          user = await userRepository.findByUsername(identifier);
        }

        if (user) {
          // Generate token and send email
          const rawToken = await tokenService.generatePasswordResetToken(
            user._id.toString(),
            config,
          );

          await emailService.sendPasswordReset(user.email, rawToken, config);

          auditLog('forgot_password', {
            userId: user._id.toString(),
            success: true,
          });
        }

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

        // Verify the token
        const tokenDoc = await tokenService.verifyToken(token, 'password_reset');

        // Validate new password against policy
        const violations = passwordService.validatePolicy(
          newPassword,
          config.registration.validation.password,
        );
        if (violations.length > 0) {
          const { ValidationError } = await import('../../errors/validation-error.js');
          throw new ValidationError(
            violations.map((msg) => ({ field: 'newPassword', message: msg })),
          );
        }

        // Hash the new password
        const hashedPassword = await passwordService.hash(newPassword);

        // Update the user's password
        await userRepository.updateById(
          tokenDoc.userId.toString(),
          { passwordHash: hashedPassword } as never,
        );

        // Mark token as used (single-use enforcement)
        await tokenService.markAsUsed(tokenDoc._id.toString());

        // Revoke all sessions (force re-login with new password)
        await sessionRepository.deleteByUserId(tokenDoc.userId.toString());

        auditLog('password_reset', {
          userId: tokenDoc.userId.toString(),
          success: true,
        });

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
