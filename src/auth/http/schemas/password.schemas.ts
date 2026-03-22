// ============================================================================
// ModularAuth-Kit — Password Schemas
// Zod validation schemas for forgot-password and reset-password endpoints.
// ============================================================================

import { z } from 'zod';

/**
 * Forgot password — accepts email (or username depending on config).
 * The field is named `identifier` for flexibility.
 */
export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or username is required')
    .transform((v) => v.toLowerCase().trim()),
});

/**
 * Reset password — token + new password.
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(1, 'New password is required'),
});
