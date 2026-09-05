import { ConfigService } from '@/config/config.service';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { API_ERROR } from '../utils';
import { IApiResponse, ValidationDetail } from '@crossroad/types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLogger,
    private readonly cfg: ConfigService,
  ) {}
  //TODO переписать потом
  catch(exception: unknown, host: ArgumentsHost): void {
    this.logger.setContext(HttpExceptionFilter.name);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = API_ERROR.INTERNAL_SERVER_ERROR;
    let errors: ValidationDetail[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const exeRes = exceptionResponse as {
          message?: string;
          errors?: ValidationDetail[];
        };
        if (Array.isArray(exeRes.message)) {
          message = API_ERROR.VALIDATION_FAILED;
          errors = exeRes.message;
        } else {
          message = exeRes?.message || message;
          errors = exeRes?.errors || [];
        }
      }
    } else if (exception instanceof Error) {
      message = API_ERROR.INTERNAL_SERVER_ERROR;
      if (this.cfg.isDev) {
        message = `${exception.name}: ${exception.message}`; // Только для дебага на деве
      }

      if (exception.name === 'PayloadTooLargeError') {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        message = API_ERROR.BODY_LARGE;
      }
    }

    this.logger.error(
      {
        status,
        message,
        params: request.params,
        query: request.query,
      },
      `[${request.method}] ${request.url}`,
    );

    const apiResponse: IApiResponse = {
      status,
      errors: {
        details: errors,
        message,
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(apiResponse);
  }
}
