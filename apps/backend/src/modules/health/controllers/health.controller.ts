import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HttpHealthIndicator } from '@nestjs/terminus';
import { HealthService } from '../services/health.service';

@ApiTags('HEALTH')
@Controller('health')
export class HealthController {
  constructor(
    private http: HttpHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  @Get('ping')
  @HealthCheck()
  checkMe() {
    return 'ok';
  }

  @Get('network')
  @HealthCheck()
  async checkNetwork() {
    return this.http.pingCheck('google', 'https://google.com', {
      timeout: 8000,
    });
  }

  @Get('db')
  @HealthCheck()
  async checkDb() {
    return this.healthService.checkDb();
  }
}
