import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  catchError,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { PinoLogger } from 'nestjs-pino';
import { trace, SpanStatusCode } from '@opentelemetry/api';

import { MetricsService } from '@/infrastructure/observability/metrics.service';
import { API_RESPONSE_TIMEOUT, API_ERROR } from '../utils';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: PinoLogger,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(API_RESPONSE_TIMEOUT),

      catchError((error: unknown) => {
        if (!(error instanceof TimeoutError)) {
          return throwError(() => error);
        }
        this.logger.setContext(TimeoutInterceptor.name);

        const request = context.switchToHttp().getRequest();

        const route = request.route?.path;
        const url = request.originalUrl ?? request.url;

        const span = trace.getActiveSpan();
        const message = API_ERROR.TIMEOUT;

        span?.setStatus({
          code: SpanStatusCode.ERROR,
          message,
        });

        span?.setAttribute('http.request.timeout_ms', API_RESPONSE_TIMEOUT);

        this.logger.warn(
          {
            method: request.method,
            url,
            route,
            timeout: API_RESPONSE_TIMEOUT,
          },
          message,
        );

        this.metrics.requestTimeout();

        return throwError(() => new RequestTimeoutException());
      }),
    );
  }
}
