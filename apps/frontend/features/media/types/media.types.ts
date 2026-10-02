export type MediaPurpose = 'avatar' | 'story-media';

export type MediaStatus = 'pending' | 'confirmed';

export interface CreateUploadUrlRequest {
  purpose: MediaPurpose;
  contentType: string;
  size: number;
  storyId?: string;
}

export interface UploadUrlResponse {
  mediaId: string;
  url: string;
  fields: Record<string, string>;
}

export interface MediaResponse {
  id: string;
  key: string;
  purpose: MediaPurpose;
  status: MediaStatus;
  contentType: string;
  url?: string;
  createdAt: string;
}
