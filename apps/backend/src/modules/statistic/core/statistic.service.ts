import { StatisticRepository } from './statistic.repository';
import {
  USER_CREATED_EVENT,
  type UserCreatedEvent,
} from '@/infrastructure/event/events/user-created.event';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class StatisticService {
  constructor(
    private readonly repository: StatisticRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(StatisticService.name);
  }

  @OnEvent(USER_CREATED_EVENT)
  async handleUserCreated(payload: UserCreatedEvent): Promise<void> {
    try {
      await this.repository.createStat(USER_CREATED_EVENT, payload.userId);
    } catch (err) {
      this.logger.error('Failed to record user.created stat', err);
    }
  }
}
