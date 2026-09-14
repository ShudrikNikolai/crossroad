import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthTokens } from '../types/auth.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(
  data: LoginRequest,
): Promise<AuthTokens> {
  const response = await api.post<ApiResponse<AuthTokens>>(
    '/auth/login',
    data,
  );

  return response.data.data;
}
