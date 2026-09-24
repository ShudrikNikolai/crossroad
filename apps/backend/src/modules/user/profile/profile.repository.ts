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

  async createProfile(uId: string, username: string): Promise<void> {
    const userId = this.toObjectId(uId);
    await this.model.create({
      userId,
      username,
    });
  }

  async findPublicProfile(_id: string): Promise<ProfileDocument | null> {
    return this.model.findOne({
      _id,
      isPublic: true,
    });
  }

  async updateByUserId(
    uId: string,
    data: Omit<Partial<ProfileDocument>, '_id'>,
  ): Promise<ProfileDocument | null> {
    const userId = this.toObjectId(uId);
    return this.model.findOneAndUpdate(
      {
        userId,
      },
      {
        ...data,
      },
    );
  }
}
