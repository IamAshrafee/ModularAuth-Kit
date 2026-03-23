// ============================================================================
// ModularAuth-Kit — Session Model
// Mongoose schema for the `sessions` collection.
// See dev-docs/architecture/database-design.md#sessions-collection
// ============================================================================

import mongoose, { Schema, Model } from 'mongoose';

import type { SessionDocument } from '../auth.types.js';
import { deviceSchema } from './device.schema.js';

// ============================================================================
// Schema Definition
// ============================================================================

const sessionSchema = new Schema<SessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    device: {
      type: deviceSchema,
      required: true,
    },
    lastActiveAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// ============================================================================
// Indexes
// ============================================================================

// sessionId unique index is handled by `unique: true` in schema
sessionSchema.index({ userId: 1 });
// TTL index — MongoDB auto-deletes documents when expiresAt < now
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================================================
// Model Export
// ============================================================================

export const SessionModel: Model<SessionDocument> = mongoose.model<SessionDocument>('Session', sessionSchema);
