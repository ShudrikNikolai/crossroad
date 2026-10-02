export function mediaUrl(value?: string) {
  if (!value) return null;
  return /^(https?:\/\/|\/(?!\/))/i.test(value) ? value : null;
}
