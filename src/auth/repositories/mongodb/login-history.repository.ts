// ============================================================================
// ModularAuth-Kit — MongoDB Login History Repository
// Implements ILoginHistoryRepository using Mongoose.
// ============================================================================

import type { LoginHistoryDocument } from '../../auth.types.js';
import type {
  ILoginHistoryRepository,
  CreateLoginHistoryData,
  PaginationOptions,
} from '../interfaces/login-history.repository.interface.js';
import { LoginHistoryModel } from '../../models/login-history.model.js';

export class MongoLoginHistoryRepository implements ILoginHistoryRepository {
  async create(data: CreateLoginHistoryData): Promise<LoginHistoryDocument> {
    return LoginHistoryModel.create(data);
  }

  async findByUserId(
    userId: string,
    options: PaginationOptions,
  ): Promise<LoginHistoryDocument[]> {
    const skip = (options.page - 1) * options.limit;
    return LoginHistoryModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(options.limit);
  }

  async deleteOldEntries(before: Date): Promise<void> {
    await LoginHistoryModel.deleteMany({ createdAt: { $lt: before } });
  }
}
