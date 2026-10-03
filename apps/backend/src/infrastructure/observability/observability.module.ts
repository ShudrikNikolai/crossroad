import { MetricsService } from './metrics.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [MetricsService],
  exports: [MetricsService],
})
export class ObservabilityModule {}
