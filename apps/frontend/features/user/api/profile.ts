import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { UpdateProfileRequest, UserProfile } from '../types/user.types';

export async function getProfile(): Promise<UserProfile | undefined> {
  const response = await api.get<ApiResponse<UserProfile>>('/profile/me');
  return response.data.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile | undefined> {
  const response = await api.patch<ApiResponse<UserProfile>>('/profile/me', data);
  return response.data.data;
}
