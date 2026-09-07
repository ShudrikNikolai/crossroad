import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenDocument } from './refresh-token.model';
import { bcryptCompare, bcryptHash } from '@/common';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly repository: RefreshTokenRepository) {}

  async create(
    userId: string,
    jti: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenDocument> {
    const tokenHash = await bcryptHash(token);

    return this.repository.create({
      userId: new Types.ObjectId(userId),
      jti,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });
  }

  async findByJti(jti: string): Promise<RefreshTokenDocument | null> {
    return this.repository.findByJti(jti);
  }

  async verify(
    token: string,
    refreshToken: RefreshTokenDocument,
  ): Promise<boolean> {
    if (!refreshToken.isValid()) {
      return false;
    }

    return bcryptCompare(token, refreshToken.tokenHash);
  }

  async revoke(jti: string): Promise<void> {
    await this.repository.revoke(jti);
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repository.revokeByUserId(userId);
  }

  async cleanup(): Promise<void> {
    await this.repository.deleteExpired();
  }
}
