import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthResponse  } from '../types/auth.types';

export interface RegisterRequest { //TODO типы из packages/schema
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function register(data: RegisterRequest): Promise<AuthResponse > {
  const response = await api.post<ApiResponse<AuthResponse >>('/auth/register', data);
  return response.data.data;
}
// TODO
