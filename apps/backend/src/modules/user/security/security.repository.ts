import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDocument, SecurityModel } from './security.model';
import { Model, Types } from 'mongoose';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(SecurityModel.name)
    private readonly model: Model<SecurityDocument>,
  ) {}

  async findByUserId(userId: Types.ObjectId): Promise<SecurityDocument | null> {
    return this.model.findOne({ userId }).exec();
  }

  async create(data: {
    userId: Types.ObjectId;
    passwordHash: string;
  }): Promise<SecurityDocument> {
    return this.model.create(data);
  }
}
