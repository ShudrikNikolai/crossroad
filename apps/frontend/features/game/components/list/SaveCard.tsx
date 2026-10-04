'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import type { GameSave } from '@/features/game/lib/saves';

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'В процессе',
  completed: 'Завершена',
};

export const SaveCard = memo(function SaveCard({
  save,
  onDelete,
}: {
  save: GameSave;
  onDelete: (playthroughId: string) => void;
}) {
  const router = useRouter();

  return (
    <article className="rounded-3xl border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-black/35">
            {STATUS_LABEL[save.state.status] ?? save.state.status}
          </p>
          <h3 className="mt-1 truncate text-lg font-semibold">{save.name}</h3>
          <p className="mt-1 truncate text-sm text-black/45">{save.storyTitle}</p>
        </div>
        <span className="shrink-0 text-xs text-black/35">
          {new Date(save.updatedAt).toLocaleString('ru-RU')}
        </span>
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="primary" onPress={() => router.push(`/games/${save.playthroughId}`)}>
          Продолжить
        </Button>
        <Button
          variant="ghost"
          onPress={() => {
            if (confirm(`Удалить сохранение «${save.name}»?`)) onDelete(save.playthroughId);
          }}
        >
          Удалить сохранение
        </Button>
      </div>
    </article>
  );
});
