import { z } from 'zod';

const booleanFromEnv = z
  .enum(['true', 'false'])
  .transform((val) => val === 'true');

export const DbSchema = z.object({
  DB_URI: z.string(),
  DB_NAME: z.string().min(3).max(50),
  DB_USERNAME: z.string().min(0).max(50).optional(),
  DB_PASS: z.string().min(0).max(50).optional(),
  DB_AUTH_SOURCE: z.string().min(0).max(50).optional(),
});

export const LoggerSchema = z.object({
  LOGGER_LEVEL: z.enum([
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
    'silent',
  ]),
  LOGGER_FORMAT: z.string().min(3),
});

export const SwaggerSchema = z.object({
  SWAGGER_ENABLE: booleanFromEnv,
  SWAGGER_PATH: z.string().min(1),
});

export const AppSchema = z.object({
  APP_PORT: z.coerce.number().min(1).max(65535),
  APP_NAME: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  APP_BASE_URL: z.string(),
  APP_GLOBAL_DEFAULT_API_VERSION: z.string().min(1).max(10),
  APP_GLOBAL_PREFIX: z.string().min(1),
  APP_LOCALE: z.string().min(2),
  TZ: z.string().min(1),
  ALLOWED_ORIGIN: z.string().min(1),
  CREDENTIALS: booleanFromEnv,
  APP_BODY_LIMIT: z.string().min(1),
});

export const AuthSchema = z.object({
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_TTL: z.coerce.number().min(1000),
  JWT_REFRESH_TTL: z.coerce.number().min(1000),
});

export const RedisSchema = z.object({
  REDIS_HOST: z.string().min(5),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string().min(0),
  REDIS_DATABASE: z.coerce.number().min(0),
});

export const StorageSchema = z.object({
  STORAGE_ENDPOINT: z.string().min(1),
  STORAGE_PORT: z.coerce.number().min(1).max(65535),
  STORAGE_ACCESS_KEY: z.string().min(1),
  STORAGE_SECRET_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_USE_SSL: booleanFromEnv,
});
