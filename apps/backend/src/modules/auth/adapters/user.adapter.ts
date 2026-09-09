import { Injectable } from '@nestjs/common';
import type { TCreateUserSchema } from '@crossroad/schemas';
import {
  IUserAuthPort,
  UserAuthView,
} from '@/modules/user/facades/user.facade';
import { UserService } from '@/modules/user/user/user.service';
import { SecurityService } from '@/modules/user/security/security.service';

@Injectable()
export class UserAuthAdapter implements IUserAuthPort {
  constructor(
    private readonly userService: UserService,
    private readonly securityService: SecurityService,
  ) {}

  // Возвращать интерфес, ан е контракт TODO
  async findById(id: string): Promise<UserAuthView | null> {
    return this.userService.findById(id);
  }

  async findByEmail(email: string): Promise<UserAuthView | null> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async createUser(data: TCreateUserSchema): Promise<UserAuthView | null> {
    const user = await this.userService.createUser(data);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    return this.securityService.verifyPassword(userId, password);
  }
}
