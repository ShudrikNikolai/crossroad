'use client';

import { Button } from '@heroui/react';
import type { GameStep } from '@/features/game/types/game.types';
import { mediaUrl } from '@/features/stories/lib/playtest/media';
import type { StoryEdge } from '@/features/stories/types/story.types';

type Props = {
  step: GameStep;
  available: StoryEdge[];
  completed: boolean;
  visitedCount: number;
  canGoBack: boolean;
  onChoose: (edgeId: string) => void;
  onBack: () => void;
  onRestart: () => void;
};

function conditionHint(count: number) {
  if (count > 1) return `Условию подходит несколько веток (${count}) — выбери, какую проверить.`;
  if (count === 1) return 'Условие выполнено — продолжай по подходящей ветке.';
  return 'Ни одна ветка условия не подошла, и безусловной ветки (ELSE) нет.';
}

export function PlaytestStage({
  step,
  available,
  completed,
  visitedCount,
  canGoBack,
  onChoose,
  onBack,
  onRestart,
}: Props) {
  const node = step.node;
  const isCondition = node.type === 'condition';
  const media = mediaUrl(node.content.mediaKey);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl">
      <div className="relative min-h-[600px] p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.14),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(14,165,233,0.10),transparent_35%)]" />
        <div className="relative">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/30">
            <span>{node.type}</span>
            <span>{visitedCount} посещённых узлов</span>
          </div>

          {media ? (
            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media} alt="" className="max-h-72 w-full object-cover" />
            </div>
          ) : node.content.mediaKey ? (
            <div className="mt-7 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-xs text-white/35">
              mediaKey: {node.content.mediaKey}
            </div>
          ) : null}

          {node.content.speaker && (
            <div className="mt-10 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                {node.content.speaker.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-sm font-medium text-white/60">{node.content.speaker}</div>
            </div>
          )}

          <div className="mt-5 whitespace-pre-wrap text-2xl leading-relaxed sm:text-3xl">
            {node.content.text || '…'}
          </div>

          {completed ? (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-400/10 px-4 py-4 text-emerald-300">
              <span>История завершена.</span>
              <Button size="sm" variant="tertiary" onPress={onRestart}>
                Начать заново
              </Button>
            </div>
          ) : (
            <div className="mt-10 grid gap-3">
              {isCondition && (
                <div className="rounded-2xl bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                  {conditionHint(available.length)}
                </div>
              )}
              {available.map((edge, index) => (
                <button
                  key={edge.id}
                  type="button"
                  onClick={() => onChoose(edge.id)}
                  className="group rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 text-left transition hover:-translate-y-px hover:border-white/25 hover:bg-white/[0.09]"
                >
                  <span className="mr-3 inline-grid size-7 place-items-center rounded-lg bg-white/10 text-xs text-white/50 group-hover:bg-white/15">
                    {index + 1}
                  </span>
                  <span className="font-medium">{edge.label || 'Продолжить'}</span>
                  {edge.conditions?.length ? (
                    <span className="ml-3 text-xs text-white/30">
                      {edge.conditions.length} услов.
                    </span>
                  ) : null}
                </button>
              ))}
              {!available.length && !isCondition && (
                <p className="text-sm text-white/40">У этого узла нет доступных переходов.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 sm:px-10">
        <span className="text-xs text-white/30">
          1–9 — выбор · Enter / Space — продолжить, если вариант один
        </span>
        <Button size="sm" variant="tertiary" isDisabled={!canGoBack} onPress={onBack}>
          ← Назад
        </Button>
      </div>
    </section>
  );
}
