import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from './user.model';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(UserModel.name)
    model: Model<UserDocument>,
  ) {
    super(model);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model
      .findOne({
        email: email.toLowerCase(),
      })
      .exec();
  }
}
