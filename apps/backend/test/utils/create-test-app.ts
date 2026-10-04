import { AppModule } from '../../src/app.module';
import { ConfigService } from '../../src/config';
import { INestApplication, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

export async function createTestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { logger: false });

  app.use(cookieParser());
  const config = app.get(ConfigService);

  app.setGlobalPrefix(config.app.globalPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.app.version,
  });

  app.useBodyParser('json', { limit: config.app.bodyLimit });
  app.useBodyParser('urlencoded', {
    extended: true,
    limit: config.app.bodyLimit,
  });

  await app.init();
  return app;
}

export const API_PREFIX = '/api/v1';
