import { IApiResponse } from '@crossroad/types';

export interface ApiResponse<T> extends IApiResponse<T> {
  isDev?: boolean;
}
