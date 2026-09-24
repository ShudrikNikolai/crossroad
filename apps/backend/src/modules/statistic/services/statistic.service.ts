import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StatisticRepository } from '../repositories/statistic.repository';
import {
  USER_CREATED_EVENT,
  type UserCreatedEvent,
} from '@/infrastructure/event/events/user-created.event';

@Injectable()
export class StatisticService {
  constructor(private readonly repository: StatisticRepository) {}

  @OnEvent(USER_CREATED_EVENT)
  async handleUserCreated(payload: UserCreatedEvent): Promise<void> {
    await this.repository.createStat(USER_CREATED_EVENT, payload.userId);
  }
}
