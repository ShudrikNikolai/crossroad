import { api } from '@/shared/api';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthResponse } from '../types/auth.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    data,
  );

  return response.data.data;
}
