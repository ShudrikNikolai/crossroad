export type MediaKind = 'none' | 'image' | 'key';

export function mediaKind(value?: string): MediaKind {
  if (!value) return 'none';
  if (/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(value) || /^(https?:\/\/|\/(?!\/))/i.test(value))
    return 'image';
  return 'key';
}
