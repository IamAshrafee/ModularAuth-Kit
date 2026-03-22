// ============================================================================
// ModularAuth-Kit — Rate Limit Error
// Thrown when a client exceeds the allowed request rate.
// See dev-docs/architecture/error-handling.md#ratelimiterror
// ============================================================================

import { AuthError } from './auth-error.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../auth.constants.js';

/**
 * Rate limit exceeded error. Always 429 + RATE_LIMITED.
 * Optionally includes a Retry-After value (seconds).
 */
export class RateLimitError extends AuthError {
  public readonly retryAfterSeconds?: number;

  constructor(retryAfterSeconds?: number) {
    super(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMITED,
      MESSAGES.RATE_LIMITED,
    );
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
