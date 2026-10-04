'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@heroui/react';
import { useNewGame } from '@/features/game/hooks/use-new-game';

export function NewGameScreen() {
  const router = useRouter();
  const storyId = useSearchParams().get('storyId') ?? '';
  const game = useNewGame(storyId);
  const [name, setName] = useState('Моё прохождение');

  if (game.loading)
    return <main className="grid min-h-[calc(100dvh-4rem)] place-items-center">Загрузка…</main>;

  if (!game.story)
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-zinc-50 px-6 py-12">
        <div className="mx-auto max-w-lg rounded-3xl border bg-white p-8">
          <p className="text-sm text-red-600">{game.loadError || 'История не найдена.'}</p>
          <Link href="/games" className="mt-4 inline-block text-sm text-black/50 hover:text-black">
            ← К играм
          </Link>
        </div>
      </main>
    );

  const published = game.story.status === 'published';
  const canStart = published && name.trim().length > 0 && !game.starting;

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-lg rounded-3xl border bg-white p-8">
        <p className="text-sm text-black/45">Новое прохождение</p>
        <h1 className="mt-2 text-3xl font-semibold">{game.story.title || 'История'}</h1>
        <p className="mt-3 text-sm leading-6 text-black/50">
          {game.story.description || 'Пройди опубликованную историю как игрок.'}
        </p>

        <label className="mt-7 grid gap-2 text-sm font-medium">
          <span>Имя прохождения</span>
          <Input
            autoFocus
            aria-label="Имя прохождения"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canStart) {
                event.preventDefault();
                void game.start(name);
              }
            }}
            disabled={game.starting}
            maxLength={128}
          />
        </label>

        {!published && (
          <p className="mt-4 text-sm text-amber-700">
            История ещё не опубликована — начать прохождение нельзя.
          </p>
        )}
        {game.startError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {game.startError}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <Button variant="ghost" isDisabled={game.starting} onPress={() => router.push('/games')}>
            Отмена
          </Button>
          <Button variant="primary" isDisabled={!canStart} onPress={() => void game.start(name)}>
            {game.starting ? 'Запуск…' : 'Начать игру'}
          </Button>
        </div>
      </div>
    </main>
  );
}
