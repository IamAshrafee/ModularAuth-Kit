// ============================================================================
// ModularAuth-Kit — User Repository Interface
// Database-agnostic contract for user data access.
// See dev-docs/decisions/adr-005-repository-pattern.md
// ============================================================================

import type { UserDocument, CreateUserDto, UpdateProfileDto } from '../../auth.types.js';

/**
 * Contract for user data access. Services depend on this interface,
 * not the MongoDB implementation directly.
 */
export interface IUserRepository {
  /** Create a new user */
  create(data: CreateUserDto): Promise<UserDocument>;

  /** Find user by email (excludes passwordHash) */
  findByEmail(email: string): Promise<UserDocument | null>;

  /** Find user by email including passwordHash (for login verification only) */
  findByEmailWithPassword(email: string): Promise<UserDocument | null>;

  /** Find user by ID including passwordHash (for password change verification) */
  findByIdWithPassword(id: string): Promise<UserDocument | null>;

  /** Find user by username (excludes passwordHash) */
  findByUsername(username: string): Promise<UserDocument | null>;

  /** Find user by ID (excludes passwordHash) */
  findById(id: string): Promise<UserDocument | null>;

  /** Find user by Google ID (excludes passwordHash) */
  findByGoogleId(googleId: string): Promise<UserDocument | null>;

  /** Update user profile fields by ID, returns updated document */
  updateById(id: string, data: Partial<UpdateProfileDto>): Promise<UserDocument | null>;

  /** Update user's passwordHash (internal operation, not a profile update) */
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;

  /** Link a Google account to an existing user, returns updated document */
  linkGoogleAccount(
    id: string,
    googleId: string,
    profileData?: { fullName?: string; firstName?: string; lastName?: string },
  ): Promise<UserDocument | null>;

  /** Mark user's email as verified */
  setEmailVerified(id: string): Promise<void>;

  /** Atomically increment failed login attempts and return the updated document */
  incrementFailedAttemptsAndGet(id: string): Promise<UserDocument | null>;

  /** Reset failed login attempts to 0 and clear lockUntil */
  resetFailedAttempts(id: string): Promise<void>;

  /** Lock account until the specified date */
  lockAccount(id: string, until: Date): Promise<void>;
}
