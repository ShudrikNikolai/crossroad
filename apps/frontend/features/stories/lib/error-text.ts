/** Показываем причину с сервера, если она есть. */
export const errorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? `${fallback} ${error.message}` : fallback;
