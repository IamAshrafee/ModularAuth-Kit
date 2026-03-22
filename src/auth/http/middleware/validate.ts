// ============================================================================
// ModularAuth-Kit — Validation Middleware
// Parses req.body with a Zod schema and returns 400 with field-level
// details on failure.
// See dev-docs/architecture/error-handling.md#validation-errors-zod
// ============================================================================

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

import { sendError } from '../../utils/api-response.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../../auth.constants.js';

/**
 * Create a validation middleware for the given Zod schema.
 * On success: replaces req.body with parsed (stripped/sanitized) data.
 * On failure: returns 400 with VALIDATION_ERROR and field-level details.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        MESSAGES.VALIDATION_FAILED,
        details,
      );
      return;
    }

    // Replace body with parsed data (strips unknown fields)
    req.body = result.data;
    next();
  };
}
