// ============================================================================
// ModularAuth-Kit — Rate Limiter Middleware
// Wraps express-rate-limit with per-endpoint config and custom error handler.
// See dev-docs/architecture/error-handling.md#middleware-layer
// ============================================================================

import rateLimit from 'express-rate-limit';

import type { AuthConfig } from '../../auth.types.js';
import { sendError } from '../../utils/api-response.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../../auth.constants.js';

type RateLimitEndpoint = 'login' | 'register' | 'forgotPassword' | 'changePassword';

/**
 * Create a rate limiter middleware for the given endpoint.
 * Uses config values from `config.security.rateLimiting[endpoint]`.
 */
export function createRateLimiter(
  config: AuthConfig,
  endpoint: RateLimitEndpoint,
) {
  const endpointConfig = config.security.rateLimiting[endpoint];

  return rateLimit({
    windowMs: endpointConfig.windowMs,
    max: endpointConfig.maxAttempts,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      sendError(
        res,
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ERROR_CODES.RATE_LIMITED,
        MESSAGES.RATE_LIMITED,
      );
    },
  });
}
