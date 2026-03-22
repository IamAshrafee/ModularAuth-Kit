// ============================================================================
// ModularAuth-Kit — Login History Repository Interface
// Database-agnostic contract for login history data access.
// See dev-docs/decisions/adr-005-repository-pattern.md
// ============================================================================

import type { LoginHistoryDocument, LoginEvent, DeviceInfo } from '../../auth.types.js';

/**
 * Data needed to create a login history entry.
 */
export interface CreateLoginHistoryData {
  userId: string;
  event: LoginEvent;
  ipAddress: string;
  userAgent: string;
  device: DeviceInfo;
  success: boolean;
  detail?: string;
}

/**
 * Pagination options for history queries.
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Contract for login history data access.
 */
export interface ILoginHistoryRepository {
  /** Record a new login history event */
  create(data: CreateLoginHistoryData): Promise<LoginHistoryDocument>;

  /** Find login history for a user with pagination */
  findByUserId(userId: string, options: PaginationOptions): Promise<LoginHistoryDocument[]>;

  /** Delete entries older than the given date */
  deleteOldEntries(before: Date): Promise<void>;
}
