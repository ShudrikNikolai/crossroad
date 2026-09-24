import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthUser } from '../types/auth.types';

export async function getMe(): Promise<AuthUser> {
  const response = await api.get<ApiResponse<AuthUser>>('/profile/me');
  console.log(response.data.data)
  return response.data.data;
}
