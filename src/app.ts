// ============================================================================
// ModularAuth-Kit — Express Application
// Configures Express, applies middleware, mounts auth routes, and sets up
// the global error handler.
// ============================================================================

import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import type { AuthConfig } from './auth/auth.types.js';
import { AuthService } from './auth/services/auth.service.js';
import { SessionService } from './auth/services/session.service.js';
import { TokenService } from './auth/services/token.service.js';
import { EmailService } from './auth/services/email.service.js';
import { MongoUserRepository } from './auth/repositories/mongodb/user.repository.js';
import { MongoSessionRepository } from './auth/repositories/mongodb/session.repository.js';
import { MongoTokenRepository } from './auth/repositories/mongodb/token.repository.js';
import { MongoLoginHistoryRepository } from './auth/repositories/mongodb/login-history.repository.js';
import { ConsoleEmailAdapter } from './auth/adapters/email/console.adapter.js';
import { NodemailerEmailAdapter } from './auth/adapters/email/nodemailer.adapter.js';
import { createAuthRouter } from './auth/http/routes/auth.routes.js';
import { setupSecurity } from './auth/http/middleware/security.js';
import { AuthError } from './auth/errors/auth-error.js';
import { sendError, sendSuccess } from './auth/utils/api-response.js';
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
  // Instantiate repositories
  // -----------------------------------------------------------------------

  const userRepository = new MongoUserRepository();
  const sessionRepository = new MongoSessionRepository();
  const tokenRepository = new MongoTokenRepository();
  const loginHistoryRepository = new MongoLoginHistoryRepository();

  // -----------------------------------------------------------------------
  // Instantiate services
  // -----------------------------------------------------------------------

  const sessionService = new SessionService({
    sessionRepository,
    userRepository,
  });

  const tokenService = new TokenService({ tokenRepository });

  // Email adapter — console for dev, nodemailer for prod
  const emailAdapter = config.email.adapter === 'nodemailer'
    ? new NodemailerEmailAdapter(config)
    : new ConsoleEmailAdapter();

  const emailService = new EmailService(emailAdapter);

  const authService = new AuthService({
    userRepository,
    sessionRepository,
    loginHistoryRepository,
    tokenService,
    emailService,
  });

  // -----------------------------------------------------------------------
  // Mount auth routes at /auth
  // -----------------------------------------------------------------------

  const authRouter = createAuthRouter({
    authService,
    sessionService,
    config,
    tokenService,
    emailService,
    userRepository,
    sessionRepository,
  });

  app.use('/auth', authRouter);

  // -----------------------------------------------------------------------
  // Global error handler (catch-all)
  // -----------------------------------------------------------------------

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AuthError) {
      sendError(res, error.statusCode, error.code, error.message, error.details);
      return;
    }

    console.error('[AUTH] Unexpected error:', error);
    sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.INTERNAL_ERROR,
      MESSAGES.INTERNAL_ERROR,
    );
  });

  return app;
}
