import './infrastructure/observability/telemetry';

import { NestFactory } from '@nestjs/core';
// import tls from 'node:tls';

// const originalConnect = tls.connect;
// tls.connect = function (...args: any[]) {
//   console.log('tls.connect called -', JSON.stringify(args[0] ?? args));
//   console.trace('tls.connect call stack-');
//   return originalConnect.apply(this, args as any);
// };
import { AppModule } from './app.module';
import { LoggerService } from './infrastructure/logger/logger.service';
import setupSwagger from './swagger';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from './config';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

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

  app.use(
    json({
      limit: config.app.bodyLimit,
    }),
  );

  app.use(
    urlencoded({
      extended: true,
      limit: config.app.bodyLimit,
    }),
  );

  setupSwagger(app, config, logger);

  await app.listen(config.app.port);
  logger.log(`Server is starting: http://127.0.0.1:${config.app.port}`);
}
bootstrap();
