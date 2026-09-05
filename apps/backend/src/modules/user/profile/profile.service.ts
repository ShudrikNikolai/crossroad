import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { Types } from 'mongoose';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async findByUserId(userId: string) {
    const userObjId = new Types.ObjectId(userId)
    return this.repository.findByUserId(userObjId);
  }

  async create(
    userId: Types.ObjectId,
    username: string,
  ) {
    return this.repository.create({
      userId,
      username,
    });
  }
}
