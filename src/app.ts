// ============================================================================
// ModularAuth-Kit — Express Application
// Configures Express, applies middleware, mounts auth routes, and sets up
// the global error handler.
// ============================================================================

import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import type { AuthConfig } from './auth/auth.types.js';
import { createAuthModule } from './auth/index.js';
import { setupSecurity } from './auth/http/middleware/security.js';
import { AuthError } from './auth/errors/auth-error.js';
import { sendError, sendSuccess } from './auth/utils/api-response.js';
import { auditLog } from './auth/utils/audit-logger.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from './auth/auth.constants.js';

// ============================================================================
// App Factory
// ============================================================================

export function createApp(config: AuthConfig) {
  const app = express();

  // -----------------------------------------------------------------------
  // Core middleware
  // -----------------------------------------------------------------------

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Security middleware (helmet, cookie-parser, CSRF)
  const securityMiddleware = setupSecurity(config);
  for (const mw of securityMiddleware) {
    app.use(mw);
  }

  // -----------------------------------------------------------------------
  // Health check
  // -----------------------------------------------------------------------

  app.get('/health', (_req: Request, res: Response) => {
    sendSuccess(res, HTTP_STATUS.OK, 'Server is running', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // -----------------------------------------------------------------------
  // Mount auth module at /auth
  // -----------------------------------------------------------------------

  const authRouter = createAuthModule(config);
  app.use('/auth', authRouter);

  // -----------------------------------------------------------------------
  // Global error handler (catch-all)
  // -----------------------------------------------------------------------

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AuthError) {
      sendError(res, error.statusCode, error.code, error.message, error.details);
      return;
    }

    auditLog('unexpected_error', {
      success: false,
      detail: error.message,
    });
    sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      MESSAGES.INTERNAL_ERROR,
    );
  });

  return app;
}

