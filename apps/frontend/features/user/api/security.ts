import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import { UpdatePasswordRequest, UpdateEmailRequest, UpdatePhoneRequest } from '../types/user.types';

export async function updatePassword(data: UpdatePasswordRequest): Promise<void> {
  await api.patch<ApiResponse<unknown>>('/security/upd-pass', data);
}

export async function updateEmail(data: UpdateEmailRequest): Promise<void> {
  await api.patch<ApiResponse<unknown>>('/users/email', data);
}

export async function updatePhone(data: UpdatePhoneRequest): Promise<void> {
  await api.patch<ApiResponse<unknown>>('/users/phone', data);
}
