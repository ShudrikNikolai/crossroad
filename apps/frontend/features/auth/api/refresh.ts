import { authApi } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthTokens } from '../types/auth.types';

export interface RefreshRequest {
  refreshToken: string;
}

export async function refresh(
  data: RefreshRequest,
): Promise<AuthTokens> {
  const response = await authApi.post<
    ApiResponse<AuthTokens>
  >('/auth/refresh', data);

  return response.data.data;
}
