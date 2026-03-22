// ============================================================================
// ModularAuth-Kit — Not Found Error
// Thrown when a requested resource does not exist.
// See dev-docs/architecture/error-handling.md#notfounderror
// ============================================================================

import { AuthError } from './auth-error.js';
import { HTTP_STATUS, ERROR_CODES } from '../auth.constants.js';

/**
 * Resource not found error. Always 404 + NOT_FOUND.
 */
export class NotFoundError extends AuthError {
  constructor(resource: string = 'Resource') {
    super(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND,
      `${resource} not found`,
    );
    this.name = 'NotFoundError';
  }
}
