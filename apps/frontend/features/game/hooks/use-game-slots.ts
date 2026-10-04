'use client';

import { useCallback, useEffect, useState } from 'react';
import { gameSaves, type GameSaveSlots, type GameSnapshot, type SaveSlot } from '@/features/game/lib/saves';
import { errorText } from '@/features/stories/lib/error-text';

/** Слоты читаем, только когда открыта панель сохранени */
export function useGameSlots(playthroughId: string, open: boolean) {
  const [slots, setSlots] = useState<GameSaveSlots>({});
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setSlots(await gameSaves.listSlots(playthroughId));
      setError('');
    } catch (e) {
      setError(errorText(e, 'Не удалось загрузить слоты.'));
    }
  }, [playthroughId]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  /** true — сохранено, false — ошибка (текст в `error`) */
  const save = useCallback(
    async (slot: SaveSlot, snapshot: GameSnapshot) => {
      try {
        await gameSaves.saveSlot(playthroughId, slot, snapshot);
        await refresh();
        return true;
      } catch (e) {
        setError(errorText(e, 'Не удалось сохранить слот.'));
        return false;
      }
    },
    [playthroughId, refresh],
  );

  const remove = useCallback(
    async (slot: SaveSlot) => {
      try {
        await gameSaves.deleteSlot(playthroughId, slot);
        await refresh();
      } catch (e) {
        setError(errorText(e, 'Не удалось удалить слот.'));
      }
    },
    [playthroughId, refresh],
  );

  return { slots, error, save, remove };
}
