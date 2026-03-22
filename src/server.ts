// ============================================================================
// ModularAuth-Kit — Server Entry Point
// Loads environment, connects to MongoDB, and starts the Express server.
// ============================================================================

import 'dotenv/config';

import { createApp } from './app.js';
import { createConfig } from './auth/auth.config.js';
import { connectDatabase } from './auth/adapters/database/mongodb.adapter.js';

// ============================================================================
// Bootstrap
// ============================================================================

async function bootstrap(): Promise<void> {
  const PORT = parseInt(process.env.PORT ?? '3000', 10);
  const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/modularauth';

  // 1. Create config (merges defaults + env vars, validates)
  const config = createConfig({
    // Development overrides — for local testing
    session: {
      secure: false, // Allow HTTP in development
    },
    security: {
      csrfProtection: false, // Disable CSRF for curl testing
    },
    passwordRecovery: {
      enabled: true, // Enable for development testing
    },
  });

  // 2. Connect to MongoDB
  await connectDatabase(MONGODB_URI);
  console.log(`[SERVER] Connected to MongoDB`);

  // 3. Create and start Express app
  const app = createApp(config);

  app.listen(PORT, () => {
    console.log(`[SERVER] ModularAuth-Kit running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`[SERVER] Health check: http://localhost:${PORT}/health`);
  });
}

bootstrap().catch((error) => {
  console.error('[SERVER] Fatal error during startup:', error);
  process.exit(1);
});
