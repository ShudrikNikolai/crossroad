import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from '../services/health.service';
import { Public } from '@/common';

@ApiTags('HEALTH')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  @Get('ping')
  @ApiOperation({ summary: 'Liveness probe — process is up' })
  ping() {
    return { status: 'ok' as const };
  }

  @Get('network')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe — outbound network reachable' })
  checkNetwork() {
    return this.health.check([
      () =>
        this.http.pingCheck('google', 'https://google.com', { timeout: 8000 }),
    ]);
  }

  @Get('db')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe — database reachable' })
  checkDb() {
    return this.healthService.checkDb();
  }
}
