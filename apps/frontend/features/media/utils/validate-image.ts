const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

interface ValidateImageOptions {
  maxSize?: number;
}

export function validateImage(
  file: File,
  options: ValidateImageOptions = {},
): string | null {
  const maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Поддерживаются только JPG, PNG и WebP.';
  }

  if (file.size > maxSize) {
    return 'Размер изображения не должен превышать 5 МБ.';
  }

  return null;
}
