import {
  HttpExceptionFilter,
  TimeoutInterceptor,
  TransformInterceptor,
  UserAgentMiddleware,
} from './common';
import { AppConfigModule } from './config';
import { InfrastructureModule } from './infrastructure/infra.module';
import { JwtAuthGuard } from './modules/auth/guards';
import { MainModule } from './modules/core.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [AppConfigModule, InfrastructureModule, MainModule],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAgentMiddleware).exclude('health').forRoutes('{*path}');
  }
}
