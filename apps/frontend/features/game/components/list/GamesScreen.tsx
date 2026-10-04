'use client';

import { useGamesList } from '@/features/game/hooks/use-games-list';
import { NewGamesSection } from './NewGamesSection';
import { SavesSection } from './SavesSection';

export function GamesScreen() {
  const { stories, saves, loading, error, savesError, reload, removeSave } = useGamesList();

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-black/45">Player space</p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">Игры</h1>
        <p className="mt-2 text-sm text-black/50">
          Опубликованные истории и локальные сохранения MVP.
        </p>

        <SavesSection saves={saves} error={savesError} onDelete={removeSave} />
        <NewGamesSection stories={stories} loading={loading} error={error} onRetry={reload} />
      </div>
    </main>
  );
}
