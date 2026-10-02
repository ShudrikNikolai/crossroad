'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Button } from '@heroui/react';
import { usePlaytest } from '@/features/stories/hooks/use-playtest';
import { usePlaytestHotkeys } from '@/features/stories/hooks/use-playtest-hotkeys';
import { PlaytestIssues } from './PlaytestIssues';
import { PlaytestStage } from './PlaytestStage';
import { PlaytestVariables } from './PlaytestVariables';

function Message({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center bg-zinc-950 text-white">
      {children}
    </main>
  );
}

export function PlaytestScreen({ storyId }: { storyId: string }) {
  const playtest = usePlaytest(storyId);
  const [showVariables, setShowVariables] = useState(false);
  const { graph, session, available, completed } = playtest;

  usePlaytestHotkeys({
    enabled: !!session && !completed && playtest.blockingIssues.length === 0,
    available,
    onChoose: playtest.choose,
  });

  if (playtest.loading) return <Message>Загрузка playtest…</Message>;
  if (!graph) return <Message>{playtest.error || 'Граф не найден.'}</Message>;
  if (playtest.blockingIssues.length)
    return <PlaytestIssues storyId={storyId} issues={playtest.blockingIssues} />;
  if (!session)
    return <Message>Не удалось запустить playtest: проверь стартовый узел истории.</Message>;

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#09090b] px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={`/stories/${storyId}/editor`}
              className="text-sm text-white/45 hover:text-white"
            >
              ← Редактор
            </Link>
            <h1 className="mt-1 text-lg font-semibold">{graph.story.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {graph.variables.length > 0 && (
              <Button
                size="sm"
                variant="tertiary"
                onPress={() => setShowVariables((value) => !value)}
              >
                Переменные
              </Button>
            )}
            <Button size="sm" variant="tertiary" onPress={playtest.reset}>
              Сбросить
            </Button>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <PlaytestStage
            step={session.step}
            available={available}
            completed={completed}
            visitedCount={session.history.length}
            canGoBack={session.history.length > 0}
            onChoose={playtest.choose}
            onBack={playtest.back}
            onRestart={playtest.reset}
          />
          {showVariables && (
            <PlaytestVariables
              variables={graph.variables}
              values={session.variables}
              onChange={playtest.setVariable}
            />
          )}
        </div>
      </div>
    </main>
  );
}
