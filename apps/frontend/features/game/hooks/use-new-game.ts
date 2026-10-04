'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { startGame } from '@/features/game/api/game';
import { buildDefaultVariables } from '@/features/game/lib/local-storage';
import { gameSaves } from '@/features/game/lib/saves';
import { getStory, getStoryGraph } from '@/features/stories/api/stories';
import { errorText } from '@/features/stories/lib/error-text';
import type { Story } from '@/features/stories/types/story.types';

export function useNewGame(storyId: string) {
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(!!storyId);
  const [loadError, setLoadError] = useState(storyId ? '' : 'Не указана история.');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  useEffect(() => {
    if (!storyId) return;
    let active = true;
    setLoading(true);
    setLoadError('');
    getStory(storyId)
      .then((loaded) => active && setStory(loaded))
      .catch((e) => active && setLoadError(errorText(e, 'Не удалось загрузить историю.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [storyId]);

  /** Создаёт прохождение и переходит на него. */
  const start = useCallback(
    async (rawName: string) => {
      const name = rawName.trim();
      if (!storyId || !name || starting) return;
      setStarting(true);
      setStartError('');
      try {
        // Сначала граф, если он не загрузится, на сервере не останется "висящего" прохождения.
        const graph = await getStoryGraph(storyId);
        const game = await startGame({ storyId, name });
        const now = new Date().toISOString();
        await gameSaves.upsert({
          playthroughId: game.playthroughId,
          storyId,
          storyTitle: graph.story.title,
          name,
          state: game,
          variables: buildDefaultVariables(graph.variables),
          history: [game.node.id],
          createdAt: now,
          updatedAt: now,
        });
        router.replace(`/games/${game.playthroughId}`); // starting не сбрасываем идёт переход
      } catch (e) {
        setStartError(
          errorText(e, 'Не удалось начать прохождение. Убедись, что история опубликована.'),
        );
        setStarting(false);
      }
    },
    [storyId, starting, router],
  );

  return { story, loading, loadError, starting, startError, start };
}
