import { RefreshTokenDocument, RefreshTokenModel } from './refresh-token.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshTokenDocument> {
  constructor(
    @InjectModel(RefreshTokenModel.name)
    model: Model<RefreshTokenDocument>,
  ) {
    super(model);
  }

  async findByJti(jti: string) {
    return this.findOne({ jti });
  }

  async revoke(jti: string) {
    await this.updateOne({ jti }, { $set: { revokedAt: new Date() } });
  }

  async revokeByUserId(userId: string) {
    await this.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  async deleteExpired() {
    await this.hardDeleteMany({ expiresAt: { $lt: new Date() } });
  }
}
