import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { Types } from 'mongoose';
import { TUpdateProfileSchema } from '@crossroad/schemas';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async create(userId: Types.ObjectId, username: string) {
    return this.repository.create({
      userId,
      username,
    });
  }

  async getMe(_id: string) {
    return this.repository.findOne({
      _id,
    });
  }

  async updateMe(_id: string, data: TUpdateProfileSchema) {
    return this.repository.updateById(_id, data);
  }

  async getProfile(profleId: string) {
    return this.repository.findOne({
      _id: profleId,
      isPublic: true,
    });
  }

  async uploadAvatar() {
    throw new Error('Method not implemented.');
  }
}
