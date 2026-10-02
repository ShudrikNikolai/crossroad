import type { StoredPlaytest } from '@/features/stories/types/playtest.types';

// Ключ прежний, чтобы существующие сохранения playtest не потерялись.
const KEY = 'crossroad:playtest:v1:';

export function loadStoredPlaytest(storyId: string): StoredPlaytest | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY + storyId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredPlaytest>;
    if (typeof parsed.nodeId !== 'string') return null;
    return {
      nodeId: parsed.nodeId,
      variables:
        parsed.variables && typeof parsed.variables === 'object' ? parsed.variables : {},
      history: Array.isArray(parsed.history)
        ? parsed.history.filter((id): id is string => typeof id === 'string')
        : [],
    };
  } catch {
    return null; // повреждённое сохранение игнорируем
  }
}

export function saveStoredPlaytest(storyId: string, data: StoredPlaytest) {
  try {
    window.localStorage.setItem(KEY + storyId, JSON.stringify(data));
  } catch {
    /* квота или приватный режим — playtest работает и без сохранения */
  }
}

export function clearStoredPlaytest(storyId: string) {
  try {
    window.localStorage.removeItem(KEY + storyId);
  } catch {
    /* noop */
  }
}
