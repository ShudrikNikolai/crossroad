import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { StatisticModule } from './statistic/statistic.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { StoryModule } from './story/story.module';

const modules = [
  HealthModule,
  UserModule,
  StatisticModule,
  AuthModule,
  StoryModule,
  GameModule,
];

@Module({
  imports: modules,
  exports: modules,
})
export class MainModule {}
