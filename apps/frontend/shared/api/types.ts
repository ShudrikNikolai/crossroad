export interface ApiResponse<T> {
  status: number;
  data: T;
  errors?: unknown;
  timestamp: string;
  query?: unknown;
}
// TODO
