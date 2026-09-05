import { Module } from '@nestjs/common';
import { AppLoggerModule } from './logger/logger.module';
import { RedisModule } from './redis/redis.module';
import { DbModule } from './database/db.module';
import { EventModule } from './event/event.module';
import { StorageModule } from './storage/storage.module';
import { ObservabilityModule } from './observability/observability.module';

const infrastructureModules = [
  AppLoggerModule,
  DbModule,
  RedisModule,
  EventModule,
  StorageModule,
  ObservabilityModule,
];

@Module({
  imports: infrastructureModules,
  exports: infrastructureModules,
})
export class InfrastructureModule {}
