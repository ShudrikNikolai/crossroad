'use client';

import type { UserProfile } from '@/features/user/types/user.types';
import Image from 'next/image';

interface AvatarPlaceholderProps {
  user: UserProfile;
}

export function AvatarPlaceholder({ user }: AvatarPlaceholderProps) {
  const initials = (user.displayName || user.username)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="flex items-center gap-5">
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt="Profile avatar"
          className="h-24 w-24 rounded-full object-cover ring-1 ring-black/10"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-black text-2xl font-semibold text-white">
          {initials || '?'}
        </div>
      )}

      <div>
        <p className="font-medium">Аватар</p>
        <p className="mt-1 text-sm text-black/55">Загрузка изображения будет подключена позже.</p>
        <button
          type="button"
          disabled
          className="mt-3 rounded-lg border px-3 py-2 text-sm text-black/40"
        >
          Загрузить изображение
        </button>
      </div>
    </div>
  );
}
