'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStory, getStoryGraph, publishStory, updateStory } from '@/features/stories/api/stories';
import { errorText } from '@/features/stories/lib/error-text';
import { validateStory } from '@/features/stories/lib/validate-story';
import type { Story, StoryGraph } from '@/features/stories/types/story.types';
import type {
  StoryNotice,
  StorySettingsValues,
} from '@/features/stories/types/story-details.types';

export function useStoryDetails(storyId: string) {
  const [story, setStory] = useState<Story | null>(null);
  const [graph, setGraph] = useState<StoryGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<StoryNotice | null>(null);

  // загрузка с защитой от гонки при смене id / размонтировании
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    setNotice(null);
    Promise.all([getStory(storyId), getStoryGraph(storyId)])
      .then(([loadedStory, loadedGraph]) => {
        if (!active) return;
        setStory(loadedStory);
        setGraph(loadedGraph);
      })
      .catch((error) => active && setLoadError(errorText(error, 'Не удалось загрузить историю.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [storyId]);

  // сообщение гаснет само
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const issues = useMemo(() => (graph ? validateStory(graph) : []), [graph]);
  const errors = useMemo(() => issues.filter((issue) => issue.severity === 'error'), [issues]);
  const warnings = useMemo(() => issues.filter((issue) => issue.severity === 'warning'), [issues]);

  const save = useCallback(
    async (values: StorySettingsValues) => {
      setSaving(true);
      setNotice(null);
      try {
        const next = await updateStory(storyId, {
          title: values.title.trim(),
          description: values.description.trim(),
        });
        setStory(next);
        setNotice({ kind: 'success', text: 'Изменения сохранены.' });
      } catch (error) {
        setNotice({ kind: 'error', text: errorText(error, 'Не удалось сохранить изменения.') });
      } finally {
        setSaving(false);
      }
    },
    [storyId],
  );

  const publish = useCallback(async () => {
    if (errors.length) {
      setNotice({ kind: 'error', text: 'Сначала исправь ошибки валидации.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const next = await publishStory(storyId);
      setStory(next);
      setNotice({ kind: 'success', text: 'История опубликована.' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorText(error, 'Не удалось опубликовать историю.') });
    } finally {
      setSaving(false);
    }
  }, [storyId, errors.length]);

  return {
    story,
    graph,
    loading,
    loadError,
    saving,
    notice,
    issues,
    errors,
    warnings,
    save,
    publish,
  };
}
