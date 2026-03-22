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
import { createAuthController } from '../controllers/auth.controller.js';
import { createRequireAuth } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rate-limiter.js';
import {
  buildRegisterSchema,
  buildLoginSchema,
  buildUpdateProfileSchema,
  changePasswordSchema,
} from '../schemas/auth.schemas.js';

// ============================================================================
// Route Factory
// ============================================================================

export interface AuthRouterDeps {
  authService: AuthService;
  sessionService: SessionService;
  config: AuthConfig;
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
  // Conditional routes — mounted in later phases
  // Phase 10+: Google OAuth, password recovery, email verification,
  //            session management, login history
  // -----------------------------------------------------------------------

  return router;
}
