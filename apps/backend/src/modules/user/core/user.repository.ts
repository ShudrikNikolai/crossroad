import { UserDocument, UserModel } from './user.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(UserModel.name)
    model: Model<UserDocument>,
  ) {
    super(model);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({
      email: email.toLowerCase(),
    });
  }
}
