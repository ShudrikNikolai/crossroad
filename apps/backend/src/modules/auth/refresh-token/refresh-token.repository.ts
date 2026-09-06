import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefreshTokenDocument, RefreshTokenModel } from './refresh-token.model';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokenModel.name)
    private readonly model: Model<RefreshTokenDocument>,
  ) {}

  async create(
    data: Partial<RefreshTokenModel>,
  ): Promise<RefreshTokenDocument> {
    return this.model.create(data);
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
