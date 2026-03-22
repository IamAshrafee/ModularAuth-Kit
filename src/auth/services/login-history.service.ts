// ============================================================================
// ModularAuth-Kit — Login History Service
// Business logic for recording, querying, and cleaning up login history.
// See dev-docs/architecture/overview.md
// ============================================================================

import type { LoginHistoryDocument, LoginEvent, RequestMeta, AuthConfig } from '../auth.types.js';
import type {
  ILoginHistoryRepository,
  CreateLoginHistoryData,
} from '../repositories/interfaces/login-history.repository.interface.js';
import { parseDevice } from '../utils/device-parser.js';

// ============================================================================
// Dependencies
// ============================================================================

interface LoginHistoryServiceDeps {
  loginHistoryRepository: ILoginHistoryRepository;
}

// ============================================================================
// Login History Service Class
// ============================================================================

export class LoginHistoryService {
  private readonly historyRepo: ILoginHistoryRepository;

  constructor(deps: LoginHistoryServiceDeps) {
    this.historyRepo = deps.loginHistoryRepository;
  }

  // --------------------------------------------------------------------------
  // record
  // --------------------------------------------------------------------------

  /**
   * Record a login history event.
   */
  async record(data: CreateLoginHistoryData): Promise<LoginHistoryDocument> {
    return this.historyRepo.create(data);
  }

  // --------------------------------------------------------------------------
  // getHistory
  // --------------------------------------------------------------------------

  /**
   * Get paginated login history for a user, newest first.
   */
  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    entries: LoginHistoryDocument[];
    page: number;
    limit: number;
  }> {
    // Clamp values
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100); // Max 100 per page

    const entries = await this.historyRepo.findByUserId(userId, {
      page: safePage,
      limit: safeLimit,
    });

    return {
      entries,
      page: safePage,
      limit: safeLimit,
    };
  }

  // --------------------------------------------------------------------------
  // cleanup
  // --------------------------------------------------------------------------

  /**
   * Delete login history entries older than the retention period.
   */
  async cleanup(retentionDays: number): Promise<void> {
    const cutoff = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000,
    );
    await this.historyRepo.deleteOldEntries(cutoff);
  }
}
