'use client';

import Link from 'next/link';
import { useStoryDetails } from '@/features/stories/hooks/use-story-details';
import { StoryHeader } from './StoryHeader';
import { StoryIssuesPanel } from './StoryIssuesPanel';
import { StorySettingsForm } from './StorySettingsForm';
import { StoryStats } from './StoryStats';

export function StoryDetailsScreen({ storyId }: { storyId: string }) {
  const details = useStoryDetails(storyId);
  const { story, graph } = details;

  if (details.loading)
    return <main className="grid min-h-[calc(100dvh-4rem)] place-items-center">Загрузка…</main>;

  if (!story || !graph)
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/stories" className="text-sm text-black/45 hover:text-black">
          ← Все истории
        </Link>
        <p className="mt-6">{details.loadError || 'История не найдена.'}</p>
      </main>
    );

  const published = story.status === 'published';

  function handlePublish() {
    if (
      !confirm('После публикации история блокируется для дальнейшего редактирования. Продолжить?')
    )
      return;
    void details.publish();
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <StoryHeader
          story={story}
          published={published}
          busy={details.saving}
          canPublish={details.errors.length === 0}
          onPublish={handlePublish}
        />

        <StorySettingsForm
          key={`${story.id}:${story.updatedAt}`}
          story={story}
          published={published}
          saving={details.saving}
          notice={details.notice}
          onSave={(values) => void details.save(values)}
        />

        {!published && (
          <StoryIssuesPanel
            issues={details.issues}
            errorCount={details.errors.length}
            warningCount={details.warnings.length}
          />
        )}

        <StoryStats graph={graph} />
      </div>
    </main>
  );
}
