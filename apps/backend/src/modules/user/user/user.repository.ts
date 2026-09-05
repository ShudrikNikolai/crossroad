import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from './user.model';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly model: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model
      .findOne({
        email: email.toLowerCase(),
      })
      .exec();
  }

  async create(data: Partial<UserModel>): Promise<UserDocument> {
    return this.model.create(data);
  }
}
