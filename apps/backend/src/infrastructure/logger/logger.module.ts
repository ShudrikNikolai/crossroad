import { Global, Module } from '@nestjs/common';
import { LoggerModule as LoggerPinoModule } from 'nestjs-pino';
import { LoggerService } from './logger.service';
import { IncomingMessage } from 'http';
import { ConfigService } from '@/config';

@Global()
@Module({
  imports: [
    LoggerPinoModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        autoLogging: {
          ignore: (req: IncomingMessage) =>
            req.url?.startsWith('/api/v1/health'),
        },
        pinoHttp: {
          redact: {
            paths: [
              'req.headers.cookie',
              'req.headers.authorization',
              'res.headers["set-cookie"]',
            ],
            censor: '[REDACTED]',
          },
          transport: config.isDev
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
          serializers: {
            req: (req: IncomingMessage) => ({
              method: req.method,
              url: req.url,
              headers: req.headers,
            }),
          },
          level: config.logger.level,
        },
      }),
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class AppLoggerModule {}
