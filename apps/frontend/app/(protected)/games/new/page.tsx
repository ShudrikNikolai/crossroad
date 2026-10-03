import { Suspense } from 'react';
import { NewGameScreen } from '@/features/game/components/new/NewGameScreen';

export default function NewGamePage() {
  return (
    <Suspense
      fallback={<main className="grid min-h-[calc(100dvh-4rem)] place-items-center">Загрузка…</main>}
    >
      <NewGameScreen />
    </Suspense>
  );
}
