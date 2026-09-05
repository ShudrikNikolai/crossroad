import './infrastructure/observability/telemetry';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { LoggerService } from './infrastructure/logger/logger.service.js';
import setupSwagger from './swagger.js';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from './config/config.service.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);
  app.use(cookieParser());
  const config = app.get(ConfigService);

  app.setGlobalPrefix(config.app.globalPrefix);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.app.version,
  });

  app.enableCors({
    origin: config.app.origin,
    credentials: config.app.credentials,
  });

  setupSwagger(app, config, logger);

  await app.listen(config.app.port);
  logger.log(`Server is starting: http://127.0.0.1:${config.app.port}`);

}
await bootstrap();
