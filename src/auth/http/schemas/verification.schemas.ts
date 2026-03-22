// ============================================================================
// ModularAuth-Kit — Verification Schemas
// Zod validation schemas for email verification endpoints.
// ============================================================================

import { z } from 'zod';

/**
 * Verify email — OTP code.
 */
export const verifyEmailSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
});
