import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProfileDocument, ProfileModel } from './profile.model';
import { Model, Types } from 'mongoose';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectModel(ProfileModel.name)
    private readonly model: Model<ProfileDocument>,
  ) {}

  async findByUserId(userId: Types.ObjectId): Promise<ProfileDocument | null> {
    return this.model.findOne({ userId }).exec();
  }

  async create(data: Partial<ProfileModel>): Promise<ProfileDocument> {
    return this.model.create(data);
  }
}
