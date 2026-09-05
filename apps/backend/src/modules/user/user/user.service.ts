import { Injectable } from '@nestjs/common';
import { IUserPort, UserAuthView } from '../ports/user.port';
import { UserRepository } from './user.repository';
import { TCreateUserSchema } from '@crossroad/schemas';
import { ProfileService } from '../profile/profile.service';
import { SecurityService } from '../security/security.service';
import { EventService } from '@/infrastructure/event/event.service';
import type { UserCreatedEvent } from '@/infrastructure/event/events/user-created.event';

@Injectable()
export class UserService implements IUserPort {
  constructor(
    private readonly repository: UserRepository,
    private readonly serviceProfile: ProfileService,
    private readonly serviceSecurity: SecurityService,
    private readonly eventService: EventService
  ) { }
  verifyPassword(userId: string, password: string): Promise<boolean> {
      return this.serviceSecurity.verifyPassword(userId, password)
  }

  async findByEmail(email: string): Promise<UserAuthView | null> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }

  async createUser(data: TCreateUserSchema): Promise<UserAuthView | null> {

      const user = await this.repository.create({
        email: data.email,
        isActive: true,
      });

      await Promise.all([
        this.serviceSecurity.createPassword(user._id, data.password),
        this.serviceProfile.create(user._id, data.username)
      ])

      await this.eventService.emitAsync<UserCreatedEvent>('user.created', {
        userId: user._id,
        email: user.email,
      });

      return {
        id: user._id.toString(),
        email: user.email,
      };

  }
}
