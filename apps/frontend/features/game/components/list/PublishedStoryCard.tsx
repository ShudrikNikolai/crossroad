'use client';

import Link from 'next/link';
import { memo } from 'react';
import type { Story } from '@/features/stories/types/story.types';

export const PublishedStoryCard = memo(function PublishedStoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/games/new?storyId=${encodeURIComponent(story.id)}`}
      className="group rounded-3xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <h3 className="line-clamp-2 text-xl font-semibold group-hover:underline">{story.title}</h3>
      <p className="mt-2 line-clamp-3 min-h-12 text-sm leading-6 text-black/50">
        {story.description || 'Без описания'}
      </p>
      <div className="mt-6 text-sm font-medium">Начать →</div>
    </Link>
  );
});
