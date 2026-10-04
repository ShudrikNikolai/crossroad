/** Число из текста или null, если текст пока не является корректным числом ("", "-", "1e"). */
export function parseNumberInput(text: string) {
  const value = Number(text);
  return text.trim() !== '' && Number.isFinite(value) ? value : null;
}
