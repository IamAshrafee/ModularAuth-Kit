// ============================================================================
// ModularAuth-Kit — Token Model
// Mongoose schema for the `tokens` collection.
// Stores SHA-256 hashes of password reset and email verification tokens.
// See dev-docs/architecture/database-design.md#tokens-collection
// ============================================================================

import mongoose, { Schema, Model } from 'mongoose';

import type { TokenDocument, TokenType } from '../auth.types.js';

// ============================================================================
// Schema Definition
// ============================================================================

const tokenSchema = new Schema<TokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['password_reset', 'email_verification'] satisfies TokenType[],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// ============================================================================
// Indexes
// ============================================================================

// tokenHash unique index is handled by `unique: true` in schema
tokenSchema.index({ userId: 1, type: 1 });
// TTL index — MongoDB auto-deletes expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================================================
// Model Export
// ============================================================================

export const TokenModel: Model<TokenDocument> = mongoose.model<TokenDocument>('Token', tokenSchema);
