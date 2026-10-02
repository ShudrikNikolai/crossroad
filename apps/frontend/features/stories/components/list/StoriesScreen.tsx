'use client';

import { useCallback, useState } from 'react';
import { Button } from '@heroui/react';
import { useStories } from '@/features/stories/hooks/use-stories';
import type { NewStoryValues } from '@/features/stories/types/story-list.types';
import { CreateStoryDialog } from './CreateStoryDialog';
import { StoriesEmptyState } from './StoriesEmptyState';
import { StoryCard } from './StoryCard';

export function StoriesScreen() {
  const { stories, loading, loadError, reload, create } = useStories();
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  async function handleCreate(values: NewStoryValues) {
    await create(values);
    setDialogOpen(false);
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-black/45">Рабочее пространство</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight">Истории</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              Создавай ветвящиеся истории, собирай их в граф и публикуй готовые сценарии.
            </p>
          </div>
          <Button onPress={openDialog} variant="primary">
            + Новая история
          </Button>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{loadError}</span>
            <Button size="sm" variant="tertiary" onPress={reload}>
              Повторить
            </Button>
          </div>
        )}

        {loading ? (
          <div className="mt-12 text-sm text-black/45">Загрузка историй…</div>
        ) : stories.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : loadError ? null : (
          // при ошибке загрузки «Историй пока нет» было бы неправдой
          <StoriesEmptyState onCreate={openDialog} />
        )}
      </div>

      {dialogOpen && <CreateStoryDialog onClose={closeDialog} onCreate={handleCreate} />}
    </main>
  );
}
