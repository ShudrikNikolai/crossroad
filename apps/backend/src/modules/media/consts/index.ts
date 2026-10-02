import type { TMediaPurpose } from '@crossroad/schemas';

const MB = 1024 * 1024;

export const PENDING_MEDIA_TTL_MS = 24 * 60 * 60 * 1000;
export const CLEANUP_BATCH_SIZE = 100;

export const MEDIA_RULES = {
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 2 * MB,
  },
  'story-media': {
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'audio/mpeg',
      'audio/ogg',
    ],
    maxSizeBytes: 15 * MB,
  },
} as const satisfies Record<
  TMediaPurpose,
  { allowedTypes: readonly string[]; maxSizeBytes: number }
>;

export const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
};

export const UPLOAD_URL_TTL_SECONDS = 600;
export const MEDIA_URL_TTL_SECONDS = 3600;
