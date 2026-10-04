import { RefreshTokenDocument } from './refresh-token.model';
import { RefreshTokenRepository } from './refresh-token.repository';
import { bcryptCompare, bcryptHash } from '@/common';
import { Injectable } from '@nestjs/common';

type ResponseRefreshToken = Omit<RefreshTokenDocument, '_id'> & { id: string };

@Injectable()
export class RefreshTokenService {
  constructor(private readonly repository: RefreshTokenRepository) {}

  async create(
    userId: string,
    jti: string,
    token: string,
    expiresAt: Date,
  ): Promise<ResponseRefreshToken> {
    const tokenHash = await bcryptHash(token);

    const tokenDoc = await this.repository.createDocument({
      userId: userId as any,
      jti,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });
    return this.repository.toPublic(tokenDoc);
  }

  async findByJti(jti: string): Promise<ResponseRefreshToken | null> {
    return this.repository.findByJti(jti);
  }

  async verify(
    token: string,
    refreshToken: Pick<
      RefreshTokenDocument,
      'revokedAt' | 'expiresAt' | 'tokenHash'
    >,
  ): Promise<boolean> {
    if (!this.isValid(refreshToken.revokedAt, refreshToken.expiresAt)) {
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

  private isValid(revokedAt: Date | null, expiresAt: Date): boolean {
    return revokedAt === null && expiresAt.getTime() > Date.now();
  }
}
