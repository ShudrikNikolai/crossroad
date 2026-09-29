import { Inject, Injectable } from '@nestjs/common';
import type { TCreateUserSchema } from '@crossroad/schemas';
import {
  type IUserAuthPort,
  USER_PORT,
  UserAuthView,
} from '@/modules/user/ports/user.port';

@Injectable()
export class UserAuthAdapter implements IUserAuthPort {
  constructor(@Inject(USER_PORT) private readonly userService: IUserAuthPort) {}

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
    return this.userService.verifyPassword(userId, password);
  }
}
