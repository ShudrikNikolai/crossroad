import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { StatisticModule } from './statistic/statistic.module';
import { AuthModule } from './auth/auth.module';

const modules = [HealthModule, UserModule, StatisticModule, AuthModule];

@Module({
  imports: modules,
  exports: modules,
})
export class MainModule {}
