// ============================================================================
// ModularAuth-Kit — MongoDB Session Repository
// Implements ISessionRepository using Mongoose.
// ============================================================================

import type { SessionDocument } from '../../auth.types.js';
import type { ISessionRepository, CreateSessionData } from '../interfaces/session.repository.interface.js';
import { SessionModel } from '../../models/session.model.js';

export class MongoSessionRepository implements ISessionRepository {
  async create(data: CreateSessionData): Promise<SessionDocument> {
    return SessionModel.create(data);
  }

  async findBySessionId(sessionId: string): Promise<SessionDocument | null> {
    return SessionModel.findOne({ sessionId });
  }

  async findByUserId(userId: string): Promise<SessionDocument[]> {
    return SessionModel.find({ userId }).sort({ createdAt: -1 });
  }

  async updateSessionId(oldSessionId: string, newSessionId: string): Promise<void> {
    await SessionModel.updateOne(
      { sessionId: oldSessionId },
      { $set: { sessionId: newSessionId } },
    );
  }

  async touch(sessionId: string): Promise<void> {
    await SessionModel.updateOne(
      { sessionId },
      { $set: { lastActiveAt: new Date() } },
    );
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await SessionModel.deleteOne({ sessionId });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await SessionModel.deleteMany({ userId });
  }

  async deleteByUserIdExcept(userId: string, exceptSessionId: string): Promise<void> {
    await SessionModel.deleteMany({ userId, sessionId: { $ne: exceptSessionId } });
  }

  async countByUserId(userId: string): Promise<number> {
    return SessionModel.countDocuments({ userId });
  }

  async deleteOldestByUserId(userId: string, count: number = 1): Promise<void> {
    const oldest = await SessionModel.find({ userId })
      .sort({ createdAt: 1 })
      .limit(count)
      .select('_id');

    if (oldest.length > 0) {
      await SessionModel.deleteMany({ _id: { $in: oldest.map((s) => s._id) } });
    }
  }
}
