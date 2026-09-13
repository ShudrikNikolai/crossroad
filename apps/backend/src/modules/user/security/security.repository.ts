import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDocument, SecurityModel } from './security.model';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common';

@Injectable()
export class SecurityRepository extends BaseRepository<SecurityDocument> {
  constructor(
    @InjectModel(SecurityModel.name)
    model: Model<SecurityDocument>,
  ) {
    super(model);
  }

  async createSecurity(
    uId: string,
    passwordHash: string,
  ): Promise<SecurityDocument | null> {
    const userId = this.toObjectId(uId);
    return this.model.create({ userId, passwordHash });
  }

  async findByUserId(uId: string): Promise<SecurityDocument | null> {
    const userId = this.toObjectId(uId);
    return this.model.findOne({ userId }).exec();
  }

  async updateSecurity(
    uId: string,
    passwordHash: string,
  ): Promise<SecurityDocument | null> {
    const userId = this.toObjectId(uId);
    return this.model.findOneAndUpdate(
      {
        userId,
      },
      {
        passwordHash,
      },
    );
  }
}
