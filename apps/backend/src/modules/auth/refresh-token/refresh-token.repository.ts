import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefreshTokenDocument, RefreshTokenModel } from './refresh-token.model';
import { BaseRepository } from '@/common';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshTokenDocument> {
  constructor(
    @InjectModel(RefreshTokenModel.name)
    model: Model<RefreshTokenDocument>,
  ) {
    super(model);
  }

  async findByJti(jti: string): Promise<RefreshTokenDocument | null> {
    return this.model.findOne({ jti }).exec();
  }

  async revoke(jti: string): Promise<void> {
    await this.model.updateOne(
      { jti },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  async revokeByUserId(userId: string): Promise<void> {
    const id = new Types.ObjectId(userId);

    await this.model.updateMany(
      {
        userId: id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  async deleteExpired(): Promise<void> {
    await this.model.deleteMany({
      expiresAt: {
        $lt: new Date(),
      },
    });
  }
}
