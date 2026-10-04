'use client';

import type { GameSave } from '@/features/game/lib/saves';
import { SaveCard } from './SaveCard';

export function SavesSection({
  saves,
  error,
  onDelete,
}: {
  saves: GameSave[];
  error?: string;
  onDelete: (playthroughId: string) => void;
}) {
  if (saves.length === 0 && !error) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Продолжить</h2>
      <p className="mt-1 text-sm text-black/45">Состояние прохождений хранится в браузере.</p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {saves.map((save) => (
          <SaveCard key={save.playthroughId} save={save} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
