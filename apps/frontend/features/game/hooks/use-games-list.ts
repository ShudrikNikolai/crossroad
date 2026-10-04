'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStories } from '@/features/stories/api/stories';
import { errorText } from '@/features/stories/lib/error-text';
import type { Story } from '@/features/stories/types/story.types';
import { gameSaves, type GameSave } from '@/features/game/lib/saves';

export function useGamesList() {
  const [stories, setStories] = useState<Story[]>([]);
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savesError, setSavesError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const refreshSaves = useCallback(() => {
    gameSaves
      .list()
      .then((items) => {
        setSaves(items);
        setSavesError('');
      })
      .catch((e) => setSavesError(errorText(e, 'Не удалось загрузить сохранения.')));
  }, []);

  // сохранения читаем после монтирования и обновляем, если их изменили в другой вкладке
  useEffect(() => {
    refreshSaves();
    window.addEventListener('storage', refreshSaves);
    return () => window.removeEventListener('storage', refreshSaves);
  }, [refreshSaves]);

  // пока источник — getStories(), позже заменится на публичный каталог (меняется только эта функция)
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getStories()
      .then((items) => active && setStories(items.filter((story) => story.status === 'published')))
      .catch((e) => active && setError(errorText(e, 'Не удалось загрузить опубликованные истории.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const removeSave = useCallback(
    (playthroughId: string) => {
      gameSaves
        .remove(playthroughId)
        .then(refreshSaves)
        .catch((e) => setSavesError(errorText(e, 'Не удалось удалить сохранение.')));
    },
    [refreshSaves],
  );

  return { stories, saves, loading, error, savesError, reload, removeSave };
}
