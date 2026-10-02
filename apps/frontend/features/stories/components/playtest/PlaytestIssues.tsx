'use client';

import Link from 'next/link';
import type { validateStory } from '@/features/stories/lib/validate-story';

export function PlaytestIssues({
  storyId,
  issues,
}: {
  storyId: string;
  issues: ReturnType<typeof validateStory>;
}) {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href={`/stories/${storyId}/editor`} className="text-sm text-white/50">
          ← К редактору
        </Link>
        <h1 className="mt-10 text-3xl font-semibold">Playtest недоступен</h1>
        <p className="mt-2 text-white/60">Исправь ошибки графа, затем запусти тестирование снова.</p>
        <div className="mt-6 grid gap-2">
          {issues.map((issue, index) => (
            <div key={index} className="rounded-2xl bg-red-950/60 px-4 py-3 text-sm text-red-200">
              {issue.message}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
