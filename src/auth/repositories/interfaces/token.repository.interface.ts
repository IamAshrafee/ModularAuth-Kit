// ============================================================================
// ModularAuth-Kit — Token Repository Interface
// Database-agnostic contract for token data access.
// See dev-docs/decisions/adr-005-repository-pattern.md
// ============================================================================

import type { TokenDocument, TokenType } from '../../auth.types.js';

/**
 * Data needed to create a new token.
 */
export interface CreateTokenData {
  userId: string;
  tokenHash: string;
  type: TokenType;
  expiresAt: Date;
}

/**
 * Contract for token data access.
 */
export interface ITokenRepository {
  /** Create a new token */
  create(data: CreateTokenData): Promise<TokenDocument>;

  /** Find a token by its SHA-256 hash */
  findByHash(tokenHash: string): Promise<TokenDocument | null>;

  /** Mark a token as used (set usedAt = now) */
  markAsUsed(id: string): Promise<void>;

  /** Delete all tokens for a user of a specific type (invalidation before creating new) */
  deleteByUserAndType(userId: string, type: TokenType): Promise<void>;

  /** Delete all tokens for a user (used on account deletion) */
  deleteByUserId(userId: string): Promise<void>;
}
