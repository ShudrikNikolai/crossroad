'use client';

import {
  type ChangeEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';

import type { UserProfile } from '@/features/user/types/user.types';

import { useMediaUpload } from '@/features/media/hooks/use-media-upload';
import { validateImage } from '@/features/media/utils/validate-image';

interface AvatarPlaceholderProps {
  user: UserProfile;

  onAvatarUploaded?: (avatarUrl: string) => void;
}

export function AvatarPlaceholder({
  user,
  onAvatarUploaded,
}: AvatarPlaceholderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] =
    useState<string | null>(null);

  const {
    upload,
    isUploading,
    error: uploadError,
  } = useMediaUpload({
    purpose: 'avatar',

    onSuccess: (media) => {
      if (!media.url) {
        return;
      }

      setPreviewUrl(media.url);
      onAvatarUploaded?.(media.url);
    },
  });

  const initials = (user.displayName || user.username)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const avatarUrl = previewUrl ?? user.avatarUrl;

  const handleSelectFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      /**
       * Позволяем выбрать тот же файл повторно.
       */
      event.target.value = '';

      if (!file) {
        return;
      }

      setValidationError(null);

      const validationError = validateImage(file);

      if (validationError) {
        setValidationError(validationError);
        return;
      }

      /**
       * Показываем локальный preview сразу,
       * не дожидаясь MinIO.
       */
      const localPreviewUrl = URL.createObjectURL(file);

      setPreviewUrl(localPreviewUrl);

      const media = await upload(file);

      /**
       * Если upload завершился ошибкой,
       * возвращаем предыдущий avatar.
       */
      if (!media) {
        setPreviewUrl(user.avatarUrl ?? null);
      }

      URL.revokeObjectURL(localPreviewUrl);
    },
    [upload, user.avatarUrl],
  );

  const handleUploadClick = () => {
    if (isUploading) {
      return;
    }

    inputRef.current?.click();
  };

  const error = validationError ?? uploadError;

  return (
    <div className="flex items-start gap-5">
      <div className="relative h-24 w-24 shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Аватар пользователя"
            className="h-24 w-24 rounded-full object-cover ring-1 ring-black/10"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-2xl font-semibold text-white">
            {initials || '?'}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <span className="text-xs font-medium text-white">
              Загрузка…
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="font-medium">
          Аватар
        </p>

        <p className="mt-1 text-sm text-black/55">
          JPG, PNG или WebP. Максимальный размер — 5 МБ.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSelectFile}
          disabled={isUploading}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="mt-3 rounded-lg border px-3 py-2 text-sm transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading
            ? 'Загрузка…'
            : 'Загрузить изображение'}
        </button>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
