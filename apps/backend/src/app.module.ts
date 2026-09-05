import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppConfigModule } from './config';
import { InfrastructureModule } from './infrastructure/infra.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  HttpExceptionFilter,
  TimeoutInterceptor,
  TransformInterceptor,
  UserAgentMiddleware,
} from './common';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { MainModule } from './modules/main.module';

@Module({
  imports: [AppConfigModule, InfrastructureModule, MainModule],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAgentMiddleware).exclude('health').forRoutes('{*path}');
  }
}
