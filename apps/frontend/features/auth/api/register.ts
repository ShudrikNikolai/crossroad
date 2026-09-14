import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthTokens } from '../types/auth.types';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export async function register(
  data: RegisterRequest,
): Promise<AuthTokens> {
  const response = await api.post<ApiResponse<AuthTokens>>(
    '/auth/register',
    data,
  );

  return response.data.data;
}
