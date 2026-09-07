import { Injectable } from '@nestjs/common';
import { SecurityRepository } from './security.repository';
import { Types } from 'mongoose';
import { bcryptCompare, bcryptHash } from '@/common';
// Types.ObjectId( TODO к одному формату
@Injectable()
export class SecurityService {
  constructor(private readonly repository: SecurityRepository) {}

  async createPassword(
    userId: Types.ObjectId,
    password: string,
  ): Promise<void> {
    const passwordHash = await bcryptHash(password);

    await this.repository.create({
      userId,
      passwordHash,
    });
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const security = await this.repository.findByUserId(
      new Types.ObjectId(userId),
    );

    if (!security) {
      return false;
    }

    return bcryptCompare(password, security.passwordHash);
  }
}
