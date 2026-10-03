import { SecurityDocument, SecurityModel } from './security.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SecurityRepository extends BaseRepository<SecurityDocument> {
  constructor(
    @InjectModel(SecurityModel.name)
    model: Model<SecurityDocument>,
  ) {
    super(model);
  }

  async createSecurity(
    userId: string,
    passwordHash: string,
  ): Promise<SecurityDocument | null> {
    return this.createDocument({ userId: userId as any, passwordHash });
  }

  async findByUserId(userId: string): Promise<SecurityDocument | null> {
    return this.findOne({ userId });
  }

  async updateSecurity(
    userId: string,
    passwordHash: string,
  ): Promise<SecurityDocument | null> {
    return this.updateOne(
      {
        userId,
      },
      {
        passwordHash,
      },
    );
  }
}
