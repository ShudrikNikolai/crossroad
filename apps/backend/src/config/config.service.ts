import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { CONST } from './cfg';
import type {
  TAppConfig,
  TAuthConfig,
  TDataBaseConfig,
  TLoggerConfig,
  TRedisConfig,
  TSwaggerConfig,
  IConfigs,
} from './cfg';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get app(): TAppConfig {
    return this.getOrThrow(CONST.APP);
  }

  get swagger(): TSwaggerConfig {
    return this.getOrThrow(CONST.SWAGGER);
  }

  get redis(): TRedisConfig {
    return this.getOrThrow(CONST.REDIS);
  }

  get logger(): TLoggerConfig {
    return this.getOrThrow(CONST.LOGGER);
  }

  get database(): TDataBaseConfig {
    return this.getOrThrow(CONST.DATABASE);
  }

  get auth(): TAuthConfig {
    return this.getOrThrow(CONST.AUTH);
  }

  get isDev(): boolean {
    return this.app.nodeEnv === 'development';
  }

  getOrThrow<K extends keyof IConfigs>(propertyPath: K): IConfigs[K] {
    return this.configService.getOrThrow(propertyPath);
  }
}
