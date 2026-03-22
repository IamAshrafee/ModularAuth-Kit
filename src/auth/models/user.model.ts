// ============================================================================
// ModularAuth-Kit — User Model
// Mongoose schema for the `users` collection.
// See dev-docs/architecture/database-design.md#users-collection
// ============================================================================

import mongoose, { Schema, Model } from 'mongoose';

import type { UserDocument } from '../auth.types.js';

// ============================================================================
// Schema Definition
// ============================================================================

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false, // Not required for Google OAuth-only users
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        // Security: never expose passwordHash in API responses
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc: unknown, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ============================================================================
// Indexes
// ============================================================================

// email unique index is created by the `unique: true` in the schema definition
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// ============================================================================
// Model Export
// ============================================================================

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);
