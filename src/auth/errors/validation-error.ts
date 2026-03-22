// ============================================================================
// ModularAuth-Kit — Validation Error
// Thrown when request body fails Zod schema validation or business-rule
// validation with field-level details.
// See dev-docs/architecture/error-handling.md#validationerror
// ============================================================================

import { AuthError } from './auth-error.js';
import { HTTP_STATUS, ERROR_CODES } from '../auth.constants.js';

/**
 * Validation error with structured field-level details.
 * Always 400 + VALIDATION_ERROR.
 */
export class ValidationError extends AuthError {
  constructor(details: Array<{ field: string; message: string }>) {
    super(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      'Validation failed',
      details,
    );
    this.name = 'ValidationError';
  }
}
