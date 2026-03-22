// ============================================================================
// ModularAuth-Kit — MongoDB Database Adapter
// Handles MongoDB connection and disconnection via Mongoose.
// See dev-docs/architecture/folder-structure.md#adapters
// ============================================================================

import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose.
 *
 * @param uri - MongoDB connection string
 */
export async function connectDatabase(uri: string): Promise<void> {
  // Connection event logging
  mongoose.connection.on('connected', () => {
    console.info('[AUTH] MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    console.info('[AUTH] MongoDB disconnected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[AUTH] MongoDB connection error:', error);
  });

  await mongoose.connect(uri);
}

/**
 * Disconnect from MongoDB cleanly.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
