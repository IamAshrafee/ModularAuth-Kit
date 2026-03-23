// ============================================================================
// ModularAuth-Kit — Shared Device Sub-Schema
// Reusable Mongoose sub-schema for device information (browser, OS, type).
// Used by both session and login-history models.
// ============================================================================

import { Schema } from 'mongoose';

export const deviceSchema = new Schema(
  {
    browser: { type: String, required: true },
    os: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['desktop', 'mobile', 'tablet'],
    },
  },
  { _id: false },
);
