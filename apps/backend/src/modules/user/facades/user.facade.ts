import { UserRepository } from '../core';
import { IUserPublic } from '../dtos';
import { IUserAuthPort } from '../ports/user.port';
import { ProfileService } from '../profile';
import { SecurityService } from '../security';
import { EventService } from '@/infrastructure/event/event.service';
import { USER_CREATED_EVENT } from '@/infrastructure/event/events/user-created.event';
import { Trace } from '@/infrastructure/observability/decorators/trace.decorator';
import { MetricsService } from '@/infrastructure/observability/metrics.service';
import type { TCreateUserSchema } from '@crossroad/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserFacade implements IUserAuthPort {
  constructor(
    private readonly repository: UserRepository,
    private readonly serviceProfile: ProfileService,
    private readonly serviceSecurity: SecurityService,
    private readonly eventService: EventService,
    private readonly metricsService: MetricsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserFacade.name);
  }

  verifyPassword(userId: string, password: string): Promise<boolean> {
    return this.serviceSecurity.verifyPassword(userId, password);
  }

  async findById(id: string): Promise<IUserPublic> {
    const user = await this.repository.findById(id);

    if (!user) {
      this.logger.warn(`User not found for id "${id}"`);
      throw new NotFoundException('User not found');
    }

    return this.getUserPublic(user);
  }

  async findByEmail(email: string): Promise<IUserPublic> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      this.logger.warn(`User not found for email "${email}"`);
      throw new NotFoundException('User not found');
    }

    return this.getUserPublic(user);
  }

  @Trace('UserService.createUser')
  async createUser(data: TCreateUserSchema): Promise<IUserPublic | null> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) return null;

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
    this.metricsService.userRegistered();

    return this.getUserPublic(user);
  }

  private getUserPublic(data: any): IUserPublic {
    return {
      id: data.id,
      email: data.email,
    };
  }
}
