import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { Types } from 'mongoose';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async findByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async findById(profileId: string) {
    return this.repository.findById(profileId);
  }

  async create(userId: Types.ObjectId, username: string) {
    return this.repository.create({
      userId,
      username,
    });
  }
}
