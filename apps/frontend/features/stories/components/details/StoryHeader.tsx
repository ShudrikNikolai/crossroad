'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { StoryStatusBadge } from '@/features/stories/components/StoryStatusBadge';
import type { Story } from '@/features/stories/types/story.types';

type Props = {
  story: Story;
  published: boolean;
  busy: boolean;
  canPublish: boolean;
  onPublish: () => void;
};

export function StoryHeader({ story, published, busy, canPublish, onPublish }: Props) {
  const router = useRouter();
  const open = (path: string) => () => router.push(`/stories/${story.id}${path}`);

  return (
    <>
      <Link href="/stories" className="text-sm text-black/45 hover:text-black">
        ← Все истории
      </Link>
      <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">{story.title}</h1>
            <StoryStatusBadge status={story.status} />
          </div>
          <p className="mt-2 text-sm text-black/50">
            Обновлена {new Date(story.updatedAt).toLocaleString('ru-RU')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onPress={open('/editor')}>
            Редактор
          </Button>
          <Button onPress={open('/playtest')}>▶ Playtest</Button>
          {published && (
            <Button onPress={() => router.push(`/games/new?storyId=${encodeURIComponent(story.id)}`)}>
              Играть
            </Button>
          )}
          {!published && (
            <Button onPress={onPublish} isDisabled={busy || !canPublish}>
              Опубликовать
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
