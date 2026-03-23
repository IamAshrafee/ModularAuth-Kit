// ============================================================================
// ModularAuth-Kit — Session Controller
// HTTP handler for session management (list active sessions, revoke).
// ============================================================================

import type { Request, Response } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import { SessionService } from '../../services/session.service.js';
import { AuthError } from '../../errors/auth-error.js';
import { sendSuccess, handleError } from '../../utils/api-response.js';
import { auditLog } from '../../utils/audit-logger.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../../auth.constants.js';
import { getAuthenticatedUser } from '../request-helpers.js';

// ============================================================================
// Controller Factory
// ============================================================================

export interface SessionControllerDeps {
  sessionService: SessionService;
  config: AuthConfig;
}

export function createSessionController(deps: SessionControllerDeps) {
  const { sessionService, config } = deps;

  return {
    // -----------------------------------------------------------------------
    // GET /auth/sessions
    // -----------------------------------------------------------------------
    async listSessions(req: Request, res: Response): Promise<void> {
      try {
        const userId = getAuthenticatedUser(req)._id.toString();
        const currentSessionId = req.sessionId;

        const sessions = await sessionService.getActiveSessions(userId);

        // Map sessions to response format, marking the current session
        const mapped = sessions.map((s) => ({
          _id: s._id,
          device: s.device,
          ipAddress: s.ipAddress,
          lastActiveAt: s.lastActiveAt,
          createdAt: s.createdAt,
          isCurrent: s.sessionId === currentSessionId,
        }));

        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.SESSIONS_FETCHED, {
          sessions: mapped,
        });
      } catch (error) {
        handleError(res, error);
      }
    },

    // -----------------------------------------------------------------------
    // DELETE /auth/sessions/:id
    // -----------------------------------------------------------------------
    async revokeSession(req: Request, res: Response): Promise<void> {
      try {
        const userId = getAuthenticatedUser(req)._id.toString();
        const targetSessionId = req.params.id;

        // Verify the session belongs to this user
        const sessions = await sessionService.getActiveSessions(userId);
        const targetSession = sessions.find(
          (s) => s._id.toString() === targetSessionId,
        );

        if (!targetSession) {
          throw new AuthError(
            HTTP_STATUS.NOT_FOUND,
            ERROR_CODES.NOT_FOUND,
            'Session not found',
          );
        }

        // Prevent revoking the current session (use /logout instead)
        if (targetSession.sessionId === req.sessionId) {
          throw new AuthError(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_ERROR,
            'Cannot revoke current session. Use logout instead.',
          );
        }

        await sessionService.revokeById(targetSession.sessionId);

        auditLog('session_revoked', {
          userId,
          success: true,
          detail: `Revoked session ${targetSessionId}`,
        });

        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.SESSION_REVOKED, null);
      } catch (error) {
        handleError(res, error);
      }
    },
  };
}
