import { Injectable } from '@nestjs/common';
import { IUserAuthPort } from '../facades/user.facade';
import { UserRepository } from './user.repository';
import {
  TCreateUserSchema,
  TUpdateUserEmailSchema,
  TUpdateUserPhoneNumberSchema,
} from '@crossroad/schemas';
import { ProfileService } from '../profile/profile.service';
import { SecurityService } from '../security/security.service';
import { EventService } from '@/infrastructure/event/event.service';
import type { UserCreatedEvent } from '@/infrastructure/event/events/user-created.event';
import { IUserPublic } from '../dtos';

@Injectable()
export class UserService implements IUserAuthPort {
  constructor(
    private readonly repository: UserRepository,
    private readonly serviceProfile: ProfileService,
    private readonly serviceSecurity: SecurityService,
    private readonly eventService: EventService,
  ) {}

  verifyPassword(userId: string, password: string): Promise<boolean> {
    return this.serviceSecurity.verifyPassword(userId, password);
  }

  async findById(id: string): Promise<IUserPublic | null> {
    const user = await this.repository.findById(id);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }

  async findByEmail(email: string): Promise<IUserPublic | null> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }

  async createUser(data: TCreateUserSchema): Promise<IUserPublic | null> {
    const user = await this.repository.create({
      email: data.email,
      isActive: true,
    });

    await Promise.all([
      this.serviceSecurity.createPassword(user._id, data.password),
      this.serviceProfile.create(user._id, data.username),
    ]);

    await this.eventService.emitAsync<UserCreatedEvent>('user.created', {
      userId: user._id,
      email: user.email,
    });

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }

  async updatePhoneNumber(
    id: string,
    data: TUpdateUserPhoneNumberSchema,
  ): Promise<boolean> {
    const updPhone = await this.repository.updateById(id, data);
    return !!updPhone;
  }

  async updateEmail(
    id: string,
    data: TUpdateUserEmailSchema,
  ): Promise<boolean> {
    const updEmail = await this.repository.updateById(id, data);
    return !!updEmail;
  }
}
