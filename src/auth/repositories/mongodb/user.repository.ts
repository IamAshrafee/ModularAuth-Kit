// ============================================================================
// ModularAuth-Kit — MongoDB User Repository
// Implements IUserRepository using Mongoose.
// See dev-docs/decisions/adr-005-repository-pattern.md
// ============================================================================

import type { UserDocument, CreateUserDto, UpdateProfileDto } from '../../auth.types.js';
import type { IUserRepository } from '../interfaces/user.repository.interface.js';
import { UserModel } from '../../models/user.model.js';

export class MongoUserRepository implements IUserRepository {
  async create(data: CreateUserDto): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase().trim() }).select('-passwordHash');
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase().trim() });
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return UserModel.findOne({ username: username.toLowerCase().trim() }).select('-passwordHash');
  }

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).select('-passwordHash');
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return UserModel.findOne({ googleId }).select('-passwordHash');
  }

  async updateById(id: string, data: Partial<UpdateProfileDto>): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).select('-passwordHash');
  }

  async setEmailVerified(id: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $set: { isEmailVerified: true } });
  }

  async incrementFailedAttempts(id: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $inc: { failedLoginAttempts: 1 } });
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await UserModel.updateOne(
      { _id: id },
      { $set: { failedLoginAttempts: 0 }, $unset: { lockUntil: '' } },
    );
  }

  async lockAccount(id: string, until: Date): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $set: { lockUntil: until } });
  }
}
