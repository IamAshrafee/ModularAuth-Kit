// ============================================================================
// ModularAuth-Kit — History Controller
// HTTP handler for login history viewing.
// ============================================================================

import type { Request, Response } from 'express';

import { LoginHistoryService } from '../../services/login-history.service.js';
import { sendSuccess, handleError } from '../../utils/api-response.js';
import { HTTP_STATUS, MESSAGES } from '../../auth.constants.js';
import { getAuthenticatedUser } from '../request-helpers.js';

// ============================================================================
// Controller Factory
// ============================================================================

export interface HistoryControllerDeps {
  loginHistoryService: LoginHistoryService;
}

export function createHistoryController(deps: HistoryControllerDeps) {
  const { loginHistoryService } = deps;

  return {
    // -----------------------------------------------------------------------
    // GET /auth/login-history
    // -----------------------------------------------------------------------
    async getHistory(req: Request, res: Response): Promise<void> {
      try {
        const userId = getAuthenticatedUser(req)._id.toString();

        // Parse pagination from query params
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 20;

        const result = await loginHistoryService.getHistory(userId, page, limit);

        sendSuccess(res, HTTP_STATUS.OK, MESSAGES.HISTORY_FETCHED, {
          history: result.entries,
          page: result.page,
          limit: result.limit,
        });
      } catch (error) {
        handleError(res, error);
      }
    },
  };
}
