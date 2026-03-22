// ============================================================================
// ModularAuth-Kit — Cryptographic Utilities
// Token generation, hashing, OTP creation, and constant-time comparison.
// See dev-docs/architecture/token-system.md#token-generation
// ============================================================================

import { randomBytes, createHash, timingSafeEqual, randomInt } from 'crypto';

/**
 * Generate a cryptographically secure random token as a hex string.
 *
 * @param bytes - Number of random bytes (default 32 → 64-char hex string, 256-bit entropy)
 * @returns Hex-encoded token string
 */
export function generateToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Hash a token using SHA-256. Used for storing tokens in the database —
 * raw tokens are never persisted directly.
 *
 * SHA-256 is appropriate here (not argon2id) because tokens have high entropy
 * (256 bits), making brute-force computationally infeasible.
 *
 * @param token - The raw token string to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a numeric OTP (One-Time Password) code.
 *
 * @param length - Number of digits (default 6)
 * @returns Numeric string of the specified length (e.g. "847293")
 */
export function generateOTP(length: number = 6): string {
  const min = Math.pow(10, length - 1);    // e.g. 100000 for 6 digits
  const max = Math.pow(10, length);         // e.g. 1000000 for 6 digits
  return randomInt(min, max).toString();
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Returns false if strings differ in length (without leaking which position differs).
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Compare against self to maintain constant time before returning false
    const dummy = Buffer.from(a);
    timingSafeEqual(dummy, dummy);
    return false;
  }

  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
