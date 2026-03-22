// ============================================================================
// ModularAuth-Kit — Auth Routes
// Express Router with all core auth endpoints.
// Rate limiting, validation, and auth middleware applied per-route.
// See dev-docs/architecture/config-system.md#route-layer
// ============================================================================

import { Router } from 'express';

import type { AuthConfig } from '../../auth.types.js';
import { AuthService } from '../../services/auth.service.js';
import { SessionService } from '../../services/session.service.js';
import { TokenService } from '../../services/token.service.js';
import { EmailService } from '../../services/email.service.js';
import { createAuthController } from '../controllers/auth.controller.js';
import { createPasswordController } from '../controllers/password.controller.js';
import type { IUserRepository } from '../../repositories/interfaces/user.repository.interface.js';
import type { ISessionRepository } from '../../repositories/interfaces/session.repository.interface.js';
import { createRequireAuth } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rate-limiter.js';
import {
  buildRegisterSchema,
  buildLoginSchema,
  buildUpdateProfileSchema,
  changePasswordSchema,
} from '../schemas/auth.schemas.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/password.schemas.js';

// ============================================================================
// Route Factory
// ============================================================================

export interface AuthRouterDeps {
  authService: AuthService;
  sessionService: SessionService;
  config: AuthConfig;
  // Optional — provided when passwordRecovery or emailVerification is enabled
  tokenService?: TokenService;
  emailService?: EmailService;
  userRepository?: IUserRepository;
  sessionRepository?: ISessionRepository;
}

/**
 * Create the auth router with all core endpoints.
 * Schemas and middleware are built once at startup based on config.
 */
export function createAuthRouter(deps: AuthRouterDeps): Router {
  const { authService, sessionService, config } = deps;

  const router = Router();

  // Build schemas once at startup
  const registerSchema = buildRegisterSchema(config);
  const loginSchema = buildLoginSchema(config);
  const updateProfileSchema = buildUpdateProfileSchema(config);

  // Create middleware
  const requireAuth = createRequireAuth(sessionService, config);

  // Create controller
  const authController = createAuthController({
    authService,
    sessionService,
    config,
  });

  // -----------------------------------------------------------------------
  // Core Auth Endpoints — always mounted
  // -----------------------------------------------------------------------

  // POST /auth/register
  router.post(
    '/register',
    createRateLimiter(config, 'register'),
    validate(registerSchema),
    authController.register,
  );

  // POST /auth/login
  router.post(
    '/login',
    createRateLimiter(config, 'login'),
    validate(loginSchema),
    authController.login,
  );

  // POST /auth/logout
  router.post(
    '/logout',
    requireAuth,
    authController.logout,
  );

  // POST /auth/logout-all
  router.post(
    '/logout-all',
    requireAuth,
    authController.logoutAll,
  );

  // GET /auth/me
  router.get(
    '/me',
    requireAuth,
    authController.getProfile,
  );

  // PATCH /auth/me
  router.patch(
    '/me',
    requireAuth,
    validate(updateProfileSchema),
    authController.updateProfile,
  );

  // POST /auth/change-password
  router.post(
    '/change-password',
    requireAuth,
    validate(changePasswordSchema),
    authController.changePassword,
  );

  // -----------------------------------------------------------------------
  // Conditional: Password Recovery
  // -----------------------------------------------------------------------

  if (
    config.passwordRecovery.enabled &&
    deps.tokenService &&
    deps.emailService &&
    deps.userRepository &&
    deps.sessionRepository
  ) {
    const passwordController = createPasswordController({
      tokenService: deps.tokenService,
      emailService: deps.emailService,
      userRepository: deps.userRepository,
      sessionRepository: deps.sessionRepository,
      config,
    });

    // POST /auth/forgot-password
    router.post(
      '/forgot-password',
      createRateLimiter(config, 'forgotPassword'),
      validate(forgotPasswordSchema),
      passwordController.forgotPassword,
    );

    // POST /auth/reset-password
    router.post(
      '/reset-password',
      createRateLimiter(config, 'forgotPassword'),
      validate(resetPasswordSchema),
      passwordController.resetPassword,
    );
  }

  // -----------------------------------------------------------------------
  // Conditional routes — mounted in later phases
  // Phase 11+: Email verification, Google OAuth, session management,
  //            login history
  // -----------------------------------------------------------------------

  return router;
}
