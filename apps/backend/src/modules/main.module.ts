import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';

const modules = [HealthModule];

@Module({
  imports: modules,
  exports: modules,
})
export class MainModule {}
