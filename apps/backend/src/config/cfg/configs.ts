import { ConfigType, registerAs } from '@nestjs/config';
import {
  AppSchema,
  AuthSchema,
  DbSchema,
  LoggerSchema,
  RedisSchema,
  StorageSchema,
  SwaggerSchema,
} from './validate';
import { CONST } from './consts';

const RedisConfig = registerAs(CONST.REDIS, () => {
  const parse = RedisSchema.parse(process.env);
  return {
    host: parse.REDIS_HOST,
    port: parse.REDIS_PORT,
    ssl: false,
    rejectUnauthorized: true,
    password: parse.REDIS_PASSWORD,
    db: parse.REDIS_DATABASE,
    url: `redis://${parse.REDIS_HOST}:${parse.REDIS_PORT}`,
  };
});

type TRedisConfig = ConfigType<typeof RedisConfig>;

const LoggerConfig = registerAs(CONST.LOGGER, () => {
  const parsed = LoggerSchema.parse(process.env);
  return {
    level: parsed.LOGGER_LEVEL,
    format: parsed.LOGGER_FORMAT,
  };
});

type TLoggerConfig = ConfigType<typeof LoggerConfig>;

const SwaggerConfig = registerAs(CONST.SWAGGER, () => {
  const parsed = SwaggerSchema.parse(process.env);
  return {
    enable: parsed.SWAGGER_ENABLE,
    path: parsed.SWAGGER_PATH,
  };
});

type TSwaggerConfig = ConfigType<typeof SwaggerConfig>;

const AuthConfig = registerAs(CONST.AUTH, () => {
  const parsed = AuthSchema.parse(process.env);
  return {
    jwtSecret: parsed.JWT_SECRET,
    jwtAccessTtl: parsed.JWT_ACCESS_TTL,
    jwtRefreshSecret: parsed.JWT_REFRESH_SECRET,
    jwtRefreshTtl: parsed.JWT_REFRESH_TTL,
  };
});

type TAuthConfig = ConfigType<typeof AuthConfig>;

const AppConfig = registerAs(CONST.APP, () => {
  const parsed = AppSchema.parse(process.env);
  return {
    port: parsed.APP_PORT,
    name: parsed.APP_NAME,
    nodeEnv: parsed.NODE_ENV,
    baseUrl: parsed.APP_BASE_URL,
    version: parsed.APP_GLOBAL_DEFAULT_API_VERSION,
    globalPrefix: parsed.APP_GLOBAL_PREFIX,
    locale: parsed.APP_LOCALE,
    tz: parsed.TZ,
    origin: parsed.ALLOWED_ORIGIN,
    credentials: parsed.CREDENTIALS,
    bodyLimit: parsed.APP_BODY_LIMIT,
  };
});

type TAppConfig = ConfigType<typeof AppConfig>;

const DataBaseConfig = registerAs(CONST.DATABASE, () => {
  const parsed = DbSchema.parse(process.env);
  return {
    dbUri: parsed.DB_URI,
    dbName: parsed.DB_NAME,
    username: parsed.DB_USERNAME,
    password: parsed.DB_PASS,
    authSource: parsed.DB_AUTH_SOURCE,
  };
});

type TDataBaseConfig = ConfigType<typeof DataBaseConfig>;

const StorageConfig = registerAs(CONST.STORAGE, () => {
  const parsed = StorageSchema.parse(process.env);
  return {
    endpoint: parsed.STORAGE_ENDPOINT,
    port: parsed.STORAGE_PORT,
    accessKey: parsed.STORAGE_ACCESS_KEY,
    secretKey: parsed.STORAGE_SECRET_KEY,
    bucket: parsed.STORAGE_BUCKET,
    useSSL: parsed.STORAGE_USE_SSL,
  };
});

type TStorageConfig = ConfigType<typeof StorageConfig>;

export const Configs = {
  [CONST.REDIS]: RedisConfig,
  [CONST.LOGGER]: LoggerConfig,
  [CONST.SWAGGER]: SwaggerConfig,
  [CONST.AUTH]: AuthConfig,
  [CONST.APP]: AppConfig,
  [CONST.DATABASE]: DataBaseConfig,
  [CONST.STORAGE]: StorageConfig,
};

export interface IConfigs {
  [CONST.REDIS]: TRedisConfig;
  [CONST.LOGGER]: TLoggerConfig;
  [CONST.SWAGGER]: TSwaggerConfig;
  [CONST.AUTH]: TAuthConfig;
  [CONST.APP]: TAppConfig;
  [CONST.DATABASE]: TDataBaseConfig;
  [CONST.STORAGE]: TStorageConfig;
}

export type {
  TRedisConfig,
  TLoggerConfig,
  TSwaggerConfig,
  TAuthConfig,
  TAppConfig,
  TDataBaseConfig,
  TStorageConfig,
};
