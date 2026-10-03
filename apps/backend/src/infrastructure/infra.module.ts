import { DbModule } from './database/db.module';
import { EventModule } from './event/event.module';
import { AppLoggerModule } from './logger/logger.module';
import { ObservabilityModule } from './observability/observability.module';
import { RedisModule } from './redis/redis.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { StorageModule } from './storage/storage.module';
import { Module } from '@nestjs/common';

const infrastructureModules = [
  AppLoggerModule,
  DbModule,
  RedisModule,
  EventModule,
  StorageModule,
  ObservabilityModule,
  SchedulerModule,
];

@Module({
  imports: infrastructureModules,
  exports: infrastructureModules,
})
export class InfrastructureModule {}
