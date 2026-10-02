import type { Story } from '@/features/stories/types/story.types';

export function StoryStatusBadge({ status }: { status: Story['status'] }) {
  const published = status === 'published';
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
    >
      {published ? 'Опубликована' : 'Черновик'}
    </span>
  );
}
