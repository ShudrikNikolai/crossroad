import { confirmMedia, createUploadUrl } from '../api/media';
import type {
  MediaPurpose,
  MediaResponse,
} from '../types/media.types';

interface UploadMediaOptions {
  file: File;
  purpose: MediaPurpose;
  storyId?: string;
}

export async function uploadMedia({
  file,
  purpose,
  storyId,
}: UploadMediaOptions): Promise<MediaResponse> {
  const upload = await createUploadUrl({
    purpose,
    contentType: file.type,
    size: file.size,
    ...(storyId ? { storyId } : {}),
  });

  const formData = new FormData();

  Object.entries(upload.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append('file', file);

  const response = await fetch(upload.url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Не удалось загрузить файл в хранилище (${response.status}).`,
    );
  }

  return confirmMedia(upload.mediaId);
}
