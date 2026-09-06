import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RefreshTokenDocument } from './refresh-token.model';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly repository: RefreshTokenRepository) {}

  async create(
    userId: string,
    jti: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenDocument> {
    const tokenHash = await bcrypt.hash(token, 12);

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

    return bcrypt.compare(token, refreshToken.tokenHash);
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
