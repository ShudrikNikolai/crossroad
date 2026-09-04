import { IQueryParams } from "./pagination";

export interface IApiError {
  details: ValidationDetail[];
  message: string;
}

export type ValidationDetail =
  | string
  | {
      field?: string;
      message: string;
    };

export interface IApiResponse<T = unknown> {
  status: number;
  data?: T;
  errors?: IApiError;
  timestamp?: string;
  query?: IQueryParams | null;
}
