import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDocument, SecurityModel } from './security.model';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@/common';

@Injectable()
export class SecurityRepository extends BaseRepository<SecurityDocument> {
  constructor(
    @InjectModel(SecurityModel.name)
    model: Model<SecurityDocument>,
  ) {
    super(model);
  }

  async findByUserId(userId: Types.ObjectId): Promise<SecurityDocument | null> {
    return this.model.findOne({ userId }).exec();
  }
}
