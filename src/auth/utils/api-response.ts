// ============================================================================
// ModularAuth-Kit — API Response Helpers
// Standard response envelope functions used by all controllers.
// See dev-docs/conventions/api-response-format.md
// ============================================================================

import type { Response } from 'express';

import { AuthError } from '../errors/auth-error.js';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../auth.constants.js';
import { auditLog } from './audit-logger.js';

/**
 * Send a standardized success response.
 *
 * @param res - Express response object
 * @param statusCode - HTTP status code (200, 201, etc.)
 * @param message - Human-readable success message
 * @param data - Optional response payload (defaults to null)
 */
export function sendSuccess(
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown,
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}

/**
 * Send a standardized error response.
 *
 * @param res - Express response object
 * @param statusCode - HTTP status code (400, 401, etc.)
 * @param code - Machine-readable error code (e.g. 'INVALID_CREDENTIALS')
 * @param message - Human-readable error message
 * @param details - Optional array of additional details (validation errors)
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details: unknown[] = [],
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message, details },
  });
}

/**
 * Handle an error from a service call. If it's an AuthError, format it
 * as a structured error response. Otherwise, log and return a generic 500.
 *
 * @param res - Express response object
 * @param error - The caught error
 */
export function handleError(res: Response, error: unknown): void {
  if (error instanceof AuthError) {
    sendError(res, error.statusCode, error.code, error.message, error.details);
    return;
  }

  // Unexpected error — structured log, generic response to client
  auditLog('unexpected_error', {
    success: false,
    detail: error instanceof Error ? error.message : String(error),
  });
  sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    MESSAGES.INTERNAL_ERROR,
  );
}

