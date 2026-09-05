import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request, Response } from 'express';
import {
  IApiResponse,
  IPaginatedResponse,
  IQueryParams,
  IRawPaginatedResult,
} from '@crossroad/types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T> | IPaginatedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IApiResponse<T> | IPaginatedResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const queryParams = request.query as IQueryParams;
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      map((data: T | IRawPaginatedResult<T>) => {
        const statusCode = response.statusCode;

        if (this.isPaginated<T>(data)) {
          return this.formatPaginatedResponse(
            data,
            queryParams,
            statusCode,
            timestamp,
          );
        }

        return this.formatResponse(data, queryParams, statusCode, timestamp);
      }),
    );
  }

  private formatResponse(
    data: T,
    queryParams: IQueryParams,
    status: number,
    timestamp: string,
  ): IApiResponse<T> {
    return {
      status,
      data,
      timestamp,
      query: this.extractRelevantQueryParams(queryParams),
    };
  }

  private formatPaginatedResponse(
    data: IRawPaginatedResult<T>,
    queryParams: IQueryParams,
    status: number,
    timestamp: string,
  ): IPaginatedResponse<T> {
    const { items, meta } = data;
    const { page, limit, total } = meta;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      status,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      timestamp,
      query: this.extractRelevantQueryParams(queryParams),
    };
  }

  private extractRelevantQueryParams(
    queryParams: IQueryParams,
  ): Record<string, unknown> | null {
    const relevantParams: Record<string, unknown> = {};
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (value !== undefined && value !== '') {
        relevantParams[key] = value;
      }
    });
    return Object.keys(relevantParams).length > 0 ? relevantParams : null;
  }

  private isPaginated<K>(data: unknown): data is IRawPaginatedResult<K> {
    return !!(
      data &&
      typeof data === 'object' &&
      'items' in data &&
      'meta' in data
    );
  }
}
