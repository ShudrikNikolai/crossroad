'use client';

import { Button } from '@heroui/react';
import type { Story } from '@/features/stories/types/story.types';
import { PublishedStoryCard } from './PublishedStoryCard';

type Props = {
  stories: Story[];
  loading: boolean;
  error: string;
  onRetry: () => void;
};

export function NewGamesSection({ stories, loading, error, onRetry }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Новые игры</h2>

      {error && (
        <div
          role="alert"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <Button size="sm" variant="tertiary" onPress={onRetry}>
            Повторить
          </Button>
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-black/45">Загрузка…</p>
      ) : stories.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <PublishedStoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : error ? null : (
        <div className="mt-6 rounded-3xl border border-dashed bg-white p-12 text-center text-sm text-black/45">
          Пока нет опубликованных историй.
        </div>
      )}
    </section>
  );
}
