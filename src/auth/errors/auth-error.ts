// ============================================================================
// ModularAuth-Kit — Base Auth Error
// All auth-related errors extend this class. Provides HTTP status code,
// machine-readable error code, and optional structured details.
// See dev-docs/architecture/error-handling.md
// ============================================================================

/**
 * Base error class for all auth module errors.
 * Services throw AuthError (or subclasses); controllers catch and format the response.
 */
export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: unknown[] = [],
  ) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Preserve proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
