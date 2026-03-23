// ============================================================================
// ModularAuth-Kit — Zod Validation Schemas
// Dynamic schema builders based on AuthConfig switches.
// Schemas are built once at startup in createAuthRouter(), not per request.
// See dev-docs/architecture/config-system.md#validation-layer
// ============================================================================

import { z } from 'zod';

import type { AuthConfig } from '../../auth.types.js';

// ============================================================================
// Schema Builders
// ============================================================================

/**
 * Build the registration schema dynamically based on config.
 * Always requires email + password. Conditionally includes username,
 * fullName, firstName, lastName based on field switches.
 */
export function buildRegisterSchema(config: AuthConfig) {
  const pwConfig = config.registration.validation.password;

  // Base schema — always required
  const baseShape = {
    email: z
      .string()
      .email('Invalid email format')
      .max(config.registration.validation.email.maxLength, 'Email is too long')
      .transform((v) => v.toLowerCase().trim()),
    password: z
      .string()
      .min(pwConfig.minLength, `Password must be at least ${pwConfig.minLength} characters`)
      .max(pwConfig.maxLength, `Password must be at most ${pwConfig.maxLength} characters`),
  };

  // Start with base
  let schema = z.object(baseShape);

  // Conditional fields
  const fields = config.registration.fields;
  const usernameValidation = config.registration.validation.username;

  if (fields.username.enabled) {
    const usernameSchema = z
      .string()
      .min(usernameValidation.minLength, `Username must be at least ${usernameValidation.minLength} characters`)
      .max(usernameValidation.maxLength, `Username must be at most ${usernameValidation.maxLength} characters`)
      .regex(usernameValidation.pattern, 'Username can only contain letters, numbers, and underscores');

    if (fields.username.required) {
      schema = schema.extend({ username: usernameSchema });
    } else {
      schema = schema.extend({ username: usernameSchema.optional() });
    }
  }

  if (fields.fullName.enabled) {
    const fullNameSchema = z.string().min(1, 'Full name is required').max(100, 'Full name is too long');
    if (fields.fullName.required) {
      schema = schema.extend({ fullName: fullNameSchema });
    } else {
      schema = schema.extend({ fullName: fullNameSchema.optional() });
    }
  }

  if (fields.firstName.enabled) {
    const firstNameSchema = z.string().min(1, 'First name is required').max(50, 'First name is too long');
    if (fields.firstName.required) {
      schema = schema.extend({ firstName: firstNameSchema });
    } else {
      schema = schema.extend({ firstName: firstNameSchema.optional() });
    }
  }

  if (fields.lastName.enabled) {
    const lastNameSchema = z.string().min(1, 'Last name is required').max(50, 'Last name is too long');
    if (fields.lastName.required) {
      schema = schema.extend({ lastName: lastNameSchema });
    } else {
      schema = schema.extend({ lastName: lastNameSchema.optional() });
    }
  }

  return schema.strict();
}

/**
 * Build the login schema based on config.
 * identifier + password.
 */
export function buildLoginSchema(config: AuthConfig) {
  const identifiers = config.login.identifiers;

  let identifierMessage = 'Email is required';
  if (identifiers.includes('email') && identifiers.includes('username')) {
    identifierMessage = 'Email or username is required';
  } else if (identifiers.includes('username')) {
    identifierMessage = 'Username is required';
  }

  return z.object({
    identifier: z
      .string()
      .min(1, identifierMessage)
      .transform((v) => v.toLowerCase().trim()),
    password: z
      .string()
      .min(1, 'Password is required'),
  }).strict();
}

/**
 * Build the profile update schema based on config.
 * Only includes fields that are enabled.
 */
export function buildUpdateProfileSchema(config: AuthConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  const fields = config.registration.fields;
  const usernameValidation = config.registration.validation.username;

  if (fields.username.enabled) {
    shape.username = z
      .string()
      .min(usernameValidation.minLength)
      .max(usernameValidation.maxLength)
      .regex(usernameValidation.pattern, 'Username can only contain letters, numbers, and underscores')
      .optional();
  }

  if (fields.fullName.enabled) {
    shape.fullName = z.string().min(1).max(100).optional();
  }

  if (fields.firstName.enabled) {
    shape.firstName = z.string().min(1).max(50).optional();
  }

  if (fields.lastName.enabled) {
    shape.lastName = z.string().min(1).max(50).optional();
  }

  return z.object(shape).strict();
}

/**
 * Change password schema — always the same shape.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(1, 'New password is required'),
});
