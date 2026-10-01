import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  TCreateUserSchema,
  TUpdateUserEmailSchema,
  TUpdateUserPhoneNumberSchema,
} from '@crossroad/schemas';
import { ProfileService } from '../profile/profile.service';
import { SecurityService } from '../security/security.service';
import { EventService } from '@/infrastructure/event/event.service';
import { USER_CREATED_EVENT } from '@/infrastructure/event/events/user-created.event';
import { IUserPublic } from '../dtos';
import { IUserAuthPort } from '../ports/user.port';

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

    return this.getUserPublic(user);
  }

  async findByEmail(email: string): Promise<IUserPublic | null> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      return null;
    }

    return this.getUserPublic(user);
  }

  async createUser(data: TCreateUserSchema): Promise<IUserPublic | null> {
    const user = await this.repository.createDocument({
      email: data.email,
      isActive: true,
    });

    await Promise.all([
      this.serviceSecurity.createPassword(user.id, data.password),
      this.serviceProfile.create(user.id, data.username),
    ]);

    this.eventService.emit(USER_CREATED_EVENT, {
      userId: user.id,
      email: user.email,
    });

    return this.getUserPublic(user);
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

  private getUserPublic(data: any): IUserPublic {
    return {
      id: data.id,
      email: data.email,
    };
  }
}
