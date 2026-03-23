// ============================================================================
// ModularAuth-Kit — Module Entry Point
// The single entry point for the auth module. Developers use this to
// mount auth on their Express app with one function call.
//
// Usage:
//   import { createAuthModule } from './auth';
//   app.use('/auth', createAuthModule(config));
//
// See docs/getting-started/project-structure.md
// ============================================================================

import type { Router } from 'express';

import type { AuthConfig } from './auth.types.js';
import { AuthService } from './services/auth.service.js';
import { SessionService } from './services/session.service.js';
import { TokenService } from './services/token.service.js';
import { EmailService } from './services/email.service.js';
import { OAuthService } from './services/oauth.service.js';
import { LoginHistoryService } from './services/login-history.service.js';
import { MongoUserRepository } from './repositories/mongodb/user.repository.js';
import { MongoSessionRepository } from './repositories/mongodb/session.repository.js';
import { MongoTokenRepository } from './repositories/mongodb/token.repository.js';
import { MongoLoginHistoryRepository } from './repositories/mongodb/login-history.repository.js';
import { ConsoleEmailAdapter } from './adapters/email/console.adapter.js';
import { NodemailerEmailAdapter } from './adapters/email/nodemailer.adapter.js';
import { createAuthRouter } from './http/routes/auth.routes.js';

// ============================================================================
// Public Type Exports
// ============================================================================

export type { AuthConfig } from './auth.types.js';
export type { UserDocument, SessionDocument, LoginHistoryDocument } from './auth.types.js';
export type { CreateUserDto, UpdateProfileDto, LoginDto, RequestMeta, DeviceInfo } from './auth.types.js';
export type { LoginEvent } from './auth.types.js';
export { createConfig } from './auth.config.js';
export { AuthError } from './errors/auth-error.js';

// ============================================================================
// Module Factory
// ============================================================================

/**
 * Create the auth module router with all services wired up.
 *
 * This is the main entry point for developers using ModularAuth-Kit.
 * It initializes all repositories, services, and controllers,
 * then returns a fully configured Express Router.
 *
 * @param config - The resolved auth configuration (use createConfig() to create)
 * @returns An Express Router with all auth endpoints mounted
 *
 * @example
 * ```typescript
 * import { createAuthModule, createConfig } from './auth';
 *
 * const config = createConfig({ session: { secure: false } });
 * app.use('/auth', createAuthModule(config));
 * ```
 */
export function createAuthModule(config: AuthConfig): Router {
  // -----------------------------------------------------------------------
  // 1. Initialize Repositories
  // -----------------------------------------------------------------------

  const userRepository = new MongoUserRepository();
  const sessionRepository = new MongoSessionRepository();
  const tokenRepository = new MongoTokenRepository();
  const loginHistoryRepository = new MongoLoginHistoryRepository();

  // -----------------------------------------------------------------------
  // 2. Initialize Services
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
    sessionService,
    loginHistoryRepository,
    tokenService,
    emailService,
  });

  const oauthService = new OAuthService({
    userRepository,
    sessionService,
    loginHistoryRepository,
  });

  const loginHistoryService = new LoginHistoryService({
    loginHistoryRepository,
  });

  // -----------------------------------------------------------------------
  // 3. Build and Return Router
  // -----------------------------------------------------------------------

  return createAuthRouter({
    authService,
    sessionService,
    config,
    tokenService,
    emailService,
    userRepository,
    sessionRepository,
    oauthService,
    loginHistoryService,
    loginHistoryRepository,
  });
}
