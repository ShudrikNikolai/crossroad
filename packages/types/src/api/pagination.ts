import { IApiResponse } from "./api-response";

export type Order = 'ASC' | 'DESC';

export interface IQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: Order;
  [key: string]: unknown;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  data: T[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    filters?: Record<string, unknown>;
    sort?: string;
  };
}

export interface IRawPaginatedResult<T> {
  items: T[];

  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
