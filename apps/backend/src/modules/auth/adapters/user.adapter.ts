import { Injectable } from '@nestjs/common';
import type { TCreateUserSchema } from '@crossroad/schemas';
import { IUserPort, UserAuthView } from '@/modules/user/ports/user.port';
import { UserService } from '@/modules/user/user/user.service';
import { SecurityService } from '@/modules/user/security/security.service';

@Injectable()
export class UserAdapter implements IUserPort {
  constructor(
    private readonly userService: UserService,
    private readonly securityService: SecurityService,
  ) {}

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
