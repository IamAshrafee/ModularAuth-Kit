// ============================================================================
// ModularAuth-Kit — Password Service
// Handles password hashing, comparison, and policy validation.
// This is the ONLY file that imports argon2 — all password operations go here.
// See dev-docs/decisions/adr-001-password-hashing.md
// ============================================================================

import * as argon2 from 'argon2';

import type { PasswordValidation } from '../auth.types.js';

// ============================================================================
// argon2id Parameters (OWASP-Recommended)
// Memory: 19 MiB, Iterations: 2, Parallelism: 1
// ~300ms hashing time per password
// ============================================================================

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB in KiB
  timeCost: 2,       // iterations
  parallelism: 1,
  hashLength: 32,    // 32 bytes
};

/**
 * Hash a plaintext password with argon2id.
 *
 * @param password - The plaintext password
 * @returns The argon2id hash string (starts with `$argon2id$`)
 */
export async function hash(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Compare a plaintext password against a stored argon2id hash.
 * Uses argon2's built-in timing-safe comparison.
 *
 * @param password - The plaintext password to check
 * @param hashedPassword - The stored hash to compare against
 * @returns `true` if they match, `false` otherwise (never throws on mismatch)
 */
export async function compare(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch {
    // If the hash is malformed or invalid, treat as mismatch
    return false;
  }
}

/**
 * Validate a password against the configured policy rules.
 * Returns an array of human-readable violation messages.
 * An empty array means the password passes all checks.
 *
 * @param password - The plaintext password to validate
 * @param policy - Password validation rules from config
 * @returns Array of violation messages (empty = valid)
 */
export function validatePolicy(
  password: string,
  policy: PasswordValidation,
): string[] {
  const violations: string[] = [];

  if (password.length < policy.minLength) {
    violations.push(`Password must be at least ${policy.minLength} characters`);
  }

  if (password.length > policy.maxLength) {
    violations.push(`Password must be at most ${policy.maxLength} characters`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    violations.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    violations.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumber && !/\d/.test(password)) {
    violations.push('Password must contain at least one number');
  }

  if (policy.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    violations.push('Password must contain at least one special character');
  }

  return violations;
}
