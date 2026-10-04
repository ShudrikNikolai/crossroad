'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { initials, nodeLabel } from '@/features/game/lib/format';
import { mediaKind } from '@/features/game/lib/media';
import type { GameStep } from '@/features/game/types/game.types';
import { TypewriterText } from './TypewriterText';

type Props = {
  step: GameStep;
  done: boolean;
  progress: number;
  actionError: string;
  inputEnabled: boolean;
  onChoose: (edgeId: string) => void;
};

/**
 * Рендерится с key={node.id}: на каждом узле состояние (revealed, skipToken) начинается заново.
 */
export function GameStage({ step, done, progress, actionError, inputEnabled, onChoose }: Props) {
  const { node, choices } = step;
  const [revealed, setRevealed] = useState(false);
  const [skipToken, setSkipToken] = useState(0);
  const handleDone = useCallback(() => setRevealed(true), []);
  const skip = useCallback(() => setSkipToken((value) => value + 1), []);

  // слушатель ставится один раз и читает актуальные значения через ref
  const latest = useRef({ revealed, inputEnabled, choices, done, onChoose });
  latest.current = { revealed, inputEnabled, choices, done, onChoose };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const current = latest.current;
      if (!current.inputEnabled || event.ctrlKey || event.metaKey || event.altKey) return;

      // в полях ввода (например, переменные) цифры и пробел — это текст, а не выбор
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (event.key === ' ' || event.key === 'Enter') {
        if (target?.closest('button, a')) return; // нативный клик по кнопке/ссылке
        if (!current.revealed) {
          event.preventDefault();
          skip();
        }
        return;
      }
      if (!current.revealed || current.done || event.repeat) return;
      if (/^[1-9]$/.test(event.key)) {
        const choice = current.choices[Number(event.key) - 1];
        if (choice) current.onChoose(choice.edgeId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [skip]);

  const speaker = node.content.speaker;
  const media = node.content.mediaKey;
  const kind = mediaKind(media);

  return (
    <div className="relative flex min-w-0 flex-col">
      {media && (
        <div className="relative h-44 shrink-0 overflow-hidden border-b border-white/10 sm:h-60">
          {kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media} alt="" className="h-full w-full object-cover opacity-80" />
          ) : (
            <div className="media-key h-full">
              <span>{media}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-transparent to-black/10" />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
              {nodeLabel(node.type)}
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/25">
              {progress} / 100 history
            </span>
          </div>

          <div className="mt-10 flex items-start gap-4 sm:mt-14">
            {speaker && (
              <div className="speaker-avatar shrink-0" title={speaker}>
                {initials(speaker)}
              </div>
            )}
            <div className="min-w-0">
              {speaker && (
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  {speaker}
                </div>
              )}
              <div className="mt-3 max-w-4xl whitespace-pre-wrap text-[1.55rem] leading-[1.5] tracking-tight sm:text-[2.15rem]">
                <TypewriterText
                  text={node.content.text || '…'}
                  skipToken={skipToken}
                  onDone={handleDone}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          {!revealed && (
            <button
              onClick={skip}
              className="mb-4 text-xs text-white/35 transition hover:text-white/70"
            >
              Нажмите Enter или пробел, чтобы показать текст
            </button>
          )}
          {done ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-emerald-300">
              Прохождение завершено.
            </div>
          ) : (
            <div
              className={`grid gap-3 transition-opacity duration-300 ${revealed ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {choices.map((choice, index) => (
                <button
                  key={choice.edgeId}
                  onClick={() => onChoose(choice.edgeId)}
                  className="choice-button group flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-xs text-white/40 transition group-hover:border-white/30 group-hover:text-white/80">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 sm:text-base">
                    {choice.label || 'Продолжить'}
                  </span>
                  <span className="ml-auto text-white/20 transition group-hover:translate-x-1 group-hover:text-white/70">
                    →
                  </span>
                </button>
              ))}
              {!choices.length && <p className="text-sm text-white/35">Нет доступных вариантов.</p>}
            </div>
          )}
          {actionError && (
            <p role="alert" className="mt-4 text-sm text-red-300">
              {actionError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
