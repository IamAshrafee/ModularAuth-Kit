// ============================================================================
// ModularAuth-Kit — MongoDB Token Repository
// Implements ITokenRepository using Mongoose.
// ============================================================================

import type { TokenDocument, TokenType } from '../../auth.types.js';
import type { ITokenRepository, CreateTokenData } from '../interfaces/token.repository.interface.js';
import { TokenModel } from '../../models/token.model.js';

export class MongoTokenRepository implements ITokenRepository {
  async create(data: CreateTokenData): Promise<TokenDocument> {
    return TokenModel.create(data);
  }

  async findByHash(tokenHash: string): Promise<TokenDocument | null> {
    return TokenModel.findOne({ tokenHash });
  }

  async markAsUsed(id: string): Promise<void> {
    await TokenModel.updateOne({ _id: id }, { $set: { usedAt: new Date() } });
  }

  async deleteByUserAndType(userId: string, type: TokenType): Promise<void> {
    await TokenModel.deleteMany({ userId, type });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await TokenModel.deleteMany({ userId });
  }
}
