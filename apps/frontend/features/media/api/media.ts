import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';

import type {
  CreateUploadUrlRequest,
  MediaResponse,
  UploadUrlResponse,
} from '../types/media.types';

export async function createUploadUrl(
  data: CreateUploadUrlRequest,
): Promise<UploadUrlResponse> {
  const response = await api.post<ApiResponse<UploadUrlResponse>>(
    '/media/upload-url',
    data,
  );

  return response.data.data;
}

export async function confirmMedia(
  mediaId: string,
): Promise<MediaResponse> {
  const response = await api.post<ApiResponse<MediaResponse>>(
    `/media/${mediaId}/confirm`,
  );

  return response.data.data;
}
