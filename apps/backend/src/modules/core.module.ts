import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { StatisticModule } from './statistic/statistic.module';
import { StoryModule } from './story/story.module';
import { UserModule } from './user/user.module';
import { Module } from '@nestjs/common';

const modules = [
  HealthModule,
  UserModule,
  StatisticModule,
  AuthModule,
  StoryModule,
  GameModule,
  MediaModule,
];

@Module({
  imports: modules,
  exports: modules,
})
export class MainModule {}
