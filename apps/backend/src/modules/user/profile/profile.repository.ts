import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProfileDocument, ProfileModel } from './profile.model';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common';

@Injectable()
export class ProfileRepository extends BaseRepository<ProfileDocument> {
  constructor(
    @InjectModel(ProfileModel.name)
    model: Model<ProfileDocument>,
  ) {
    super(model);
  }

  async findByUserId(userId: string): Promise<ProfileDocument | null> {
    return this.model.findOne({ userId }).exec();
  }
}
