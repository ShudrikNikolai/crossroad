'use client';

import { useCallback, useEffect, useState } from 'react';
import { createStory, getStories } from '@/features/stories/api/stories';
import { errorText } from '@/features/stories/lib/error-text';
import type { Story } from '@/features/stories/types/story.types';
import type { NewStoryValues } from '@/features/stories/types/story-list.types';

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // загрузка с защитой от гонки; reloadKey позволяет повторить запрос кнопкой
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    getStories()
      .then((list) => active && setStories(list))
      .catch((error) => active && setLoadError(errorText(error, 'Не удалось загрузить список историй.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  /** Бросает ошибку наверх — диалог сам покажет её рядом с формой. */
  const create = useCallback(async (values: NewStoryValues) => {
    const story = await createStory({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
    });
    setStories((current) => [story, ...current.filter((item) => item.id !== story.id)]);
    return story;
  }, []);

  return { stories, loading, loadError, reload, create };
}
