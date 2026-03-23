// ============================================================================
// ModularAuth-Kit — Login History Model
// Mongoose schema for the `login_history` collection.
// See dev-docs/architecture/database-design.md#login_history-collection
// ============================================================================

import mongoose, { Schema, Model } from 'mongoose';

import type { LoginHistoryDocument, LoginEvent } from '../auth.types.js';
import { deviceSchema } from './device.schema.js';

// ============================================================================
// Schema Definition
// ============================================================================

const loginHistorySchema = new Schema<LoginHistoryDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  event: {
    type: String,
    required: true,
    enum: [
      'login_success',
      'login_failure',
      'logout',
      'password_change',
      'password_reset',
    ] satisfies LoginEvent[],
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
  success: {
    type: Boolean,
    required: true,
  },
  detail: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// ============================================================================
// Indexes
// ============================================================================

// Compound index for paginated per-user queries, newest first
loginHistorySchema.index({ userId: 1, createdAt: -1 });
// NOTE: No TTL index here. Retention is controlled by config.loginHistory.retentionDays
// and enforced by LoginHistoryService.cleanup() via a scheduled job. A hardcoded TTL
// index would ignore the user's config value, silently breaking the contract.

// ============================================================================
// Model Export
// ============================================================================

export const LoginHistoryModel: Model<LoginHistoryDocument> = mongoose.model<LoginHistoryDocument>(
  'LoginHistory',
  loginHistorySchema,
);
