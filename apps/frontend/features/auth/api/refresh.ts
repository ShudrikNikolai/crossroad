import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthResponse } from '../types/auth.types';

export async function refreshSession(): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh');
  return response.data.data;
}
