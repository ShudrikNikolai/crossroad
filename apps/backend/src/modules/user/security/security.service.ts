import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUNDS } from '../consts';
import { Injectable } from '@nestjs/common';
import { SecurityRepository } from './security.repository';
import { Types } from 'mongoose';

@Injectable()
export class SecurityService {
  constructor(private readonly repository: SecurityRepository) {}

  async createPassword(userId: Types.ObjectId, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

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

    return bcrypt.compare(password, security.passwordHash);
  }
}
