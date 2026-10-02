'use client';

import Link from 'next/link';
import { memo } from 'react';
import { StoryStatusBadge } from '@/features/stories/components/StoryStatusBadge';
import type { Story } from '@/features/stories/types/story.types';

export const StoryCard = memo(function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/stories/${story.id}`}
      className="group rounded-3xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <StoryStatusBadge status={story.status} />
        <span className="text-xs text-black/35">
          {new Date(story.updatedAt).toLocaleDateString('ru-RU')}
        </span>
      </div>
      <h2 className="mt-6 line-clamp-2 text-xl font-semibold group-hover:underline">
        {story.title}
      </h2>
      <p className="mt-2 line-clamp-3 min-h-18 text-sm leading-6 text-black/50">
        {story.description || 'Без описания'}
      </p>
      <div className="mt-6 text-sm font-medium">Открыть историю →</div>
    </Link>
  );
});
