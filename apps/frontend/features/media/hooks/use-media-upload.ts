'use client';

import { useCallback, useState } from 'react';

import { uploadMedia } from '../utils/upload-media';
import type {
  MediaPurpose,
  MediaResponse,
} from '../types/media.types';

interface UseMediaUploadOptions {
  purpose: MediaPurpose;
  storyId?: string;

  onSuccess?: (media: MediaResponse) => void;
  onError?: (error: Error) => void;
}

interface UseMediaUploadResult {
  upload: (file: File) => Promise<MediaResponse | null>;

  isUploading: boolean;
  error: string | null;

  resetError: () => void;
}

export function useMediaUpload({
  purpose,
  storyId,
  onSuccess,
  onError,
}: UseMediaUploadOptions): UseMediaUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<MediaResponse | null> => {
      setIsUploading(true);
      setError(null);

      try {
        const media = await uploadMedia({
          file,
          purpose,
          storyId,
        });

        onSuccess?.(media);

        return media;
      } catch (error) {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error('Не удалось загрузить файл.');

        setError(normalizedError.message);
        onError?.(normalizedError);

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [purpose, storyId, onSuccess, onError],
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    upload,
    isUploading,
    error,
    resetError,
  };
}
