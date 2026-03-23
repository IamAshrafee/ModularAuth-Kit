// ============================================================================
// ModularAuth-Kit — Session Repository Interface
// Database-agnostic contract for session data access.
// See dev-docs/decisions/adr-005-repository-pattern.md
// ============================================================================

import type { SessionDocument, DeviceInfo } from '../../auth.types.js';

/**
 * Data needed to create a new session.
 */
export interface CreateSessionData {
  sessionId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  device: DeviceInfo;
  expiresAt: Date;
}

/**
 * Contract for session data access.
 */
export interface ISessionRepository {
  /** Create a new session */
  create(data: CreateSessionData): Promise<SessionDocument>;

  /** Find a session by its session ID (cookie value) */
  findBySessionId(sessionId: string): Promise<SessionDocument | null>;

  /** Find all sessions for a user */
  findByUserId(userId: string): Promise<SessionDocument[]>;

  /** Replace a session's ID (for session rotation) */
  updateSessionId(oldSessionId: string, newSessionId: string): Promise<void>;

  /** Update lastActiveAt timestamp (touch) */
  touch(sessionId: string): Promise<void>;

  /** Delete a single session by session ID */
  deleteBySessionId(sessionId: string): Promise<void>;

  /** Delete all sessions for a user */
  deleteByUserId(userId: string): Promise<void>;

  /** Count active sessions for a user */
  countByUserId(userId: string): Promise<number>;

  /** Delete the N oldest sessions for a user (for max session enforcement) */
  deleteOldestByUserId(userId: string, count?: number): Promise<void>;
}
