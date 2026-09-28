import { api } from '@/shared/api';
import type { ApiResponse } from '@/shared/api/types';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.types';

export async function login(data: LoginRequest): Promise<AuthResponse | undefined> {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  } catch (e) {
    console.log(e)
    return;
  }
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshSession(): Promise<AuthResponse | undefined> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh');
  return response.data.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse | undefined> {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data;
}
