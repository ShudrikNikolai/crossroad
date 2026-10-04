import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, HttpModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
