import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StatisticRepository } from '../repositories/statistic.repository';
import type { UserCreatedEvent } from '@/infrastructure/event/events/user-created.event';

@Injectable()
export class StatisticService {
  constructor(private readonly repository: StatisticRepository) {}

  @OnEvent('user.created')
  async handleUserCreated(payload: UserCreatedEvent): Promise<void> {
    await this.repository.create({
      type: 'user.created',
      userId: payload.userId,
    });
  }
}
