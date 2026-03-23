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

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
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

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $set: { passwordHash } });
  }

  async linkGoogleAccount(
    id: string,
    googleId: string,
    profileData?: { fullName?: string; firstName?: string; lastName?: string },
  ): Promise<UserDocument | null> {
    const updateData: Record<string, unknown> = {
      googleId,
      isEmailVerified: true, // Google already verified this email
    };

    // Only set profile fields if not already set on the user
    if (profileData?.fullName) updateData.fullName = profileData.fullName;
    if (profileData?.firstName) updateData.firstName = profileData.firstName;
    if (profileData?.lastName) updateData.lastName = profileData.lastName;

    return UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select('-passwordHash');
  }

  async setEmailVerified(id: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $set: { isEmailVerified: true } });
  }

  // Atomically increment and return — prevents race condition with concurrent login attempts
  async incrementFailedAttemptsAndGet(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      id,
      { $inc: { failedLoginAttempts: 1 } },
      { new: true },
    ).select('-passwordHash');
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
