import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SecurityRepository } from './security.repository';
import { bcryptCompare, bcryptHash } from '@/common';
import { TSecurityUpdatePasswordSchema } from '@crossroad/schemas';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class SecurityService {
  constructor(
    private readonly repository: SecurityRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SecurityService.name);
  }

  async createPassword(userId: string, password: string): Promise<boolean> {
    try {
      const passwordHash = await bcryptHash(password);

      await this.repository.createSecurity(userId, passwordHash);

      return true;
    } catch (e) {
      this.logger.error({ err: e, userId }, 'Failed to create password');
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const security = await this.repository.findByUserId(userId);

    if (!security) {
      this.logger.warn({ userId }, 'Security record not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    return bcryptCompare(password, security.passwordHash);
  }

  async updatePassword(
    userId: string,
    data: TSecurityUpdatePasswordSchema,
  ): Promise<boolean> {
    const security = await this.verifyPassword(userId, data.oldPassword);

    if (!security) {
      this.logger.warn(`Update password, not complete for user "${userId}"`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const newPasswordHash = await bcryptHash(data.newPassword);

    await this.repository.updateSecurity(userId, newPasswordHash);

    return true;
  }
}
