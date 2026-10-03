import { UserRepository } from './user.repository';
import type {
  TUpdateUserEmailSchema,
  TUpdateUserPhoneNumberSchema,
} from '@crossroad/schemas';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserService.name);
  }

  async updatePhoneNumber(
    id: string,
    data: TUpdateUserPhoneNumberSchema,
  ): Promise<boolean> {
    try {
      const updPhone = await this.repository.updateById(id, data);
      return !!updPhone;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  async updateEmail(
    id: string,
    data: TUpdateUserEmailSchema,
  ): Promise<boolean> {
    try {
      const updEmail = await this.repository.updateById(id, data);
      return !!updEmail;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
