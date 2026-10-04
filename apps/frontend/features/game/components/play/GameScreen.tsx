'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useFlash } from '@/features/game/hooks/use-flash';
import { useGameSession } from '@/features/game/hooks/use-game-session';
import { useGameSlots } from '@/features/game/hooks/use-game-slots';
import { useNodeTransition } from '@/features/game/hooks/use-node-transition';
import type { SaveSlot } from '@/features/game/lib/saves';
import type { GamePanelId } from '@/features/game/types/game-session.types';
import { GameHeader } from './GameHeader';
import { GamePanel } from './GamePanel';
import { GameSidebar } from './GameSidebar';
import { GameStage } from './GameStage';
import { HistoryPanel } from './HistoryPanel';
import { SavePanel } from './SavePanel';
import { VariablesPanel } from './VariablesPanel';

const PANEL_TITLES: Record<Exclude<GamePanelId, 'none'>, string> = {
  save: 'Сохранения',
  history: 'История',
  variables: 'Переменные',
};

function Message({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center bg-[#09090b] px-6 text-center text-white">
      <div>{children}</div>
    </main>
  );
}

export function GameScreen({ playthroughId }: { playthroughId: string }) {
  const { flash, show } = useFlash();
  const game = useGameSession(playthroughId, {
    onAutosave: () => show('Автосохранение'),
    onSaveError: () => show('Не удалось сохранить', 2500),
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<GamePanelId>('none');
  const slots = useGameSlots(playthroughId, panel === 'save');
  const transition = useNodeTransition(game.session?.step.node.id);

  // глобальные клавиши: Escape / S / H. Слушатель один; по event.code, чтобы работало в русской раскладке
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setPanel('none');
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || menuOpenRef.current) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.code === 'KeyH') setPanel((value) => (value === 'history' ? 'none' : 'history'));
      if (event.code === 'KeyS') setPanel((value) => (value === 'save' ? 'none' : 'save'));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (game.loading) return <Message>Загрузка…</Message>;

  if (game.loadError || !game.session || !game.graph)
    return (
      <Message>
        <p>{game.loadError || 'Прохождение не найдено.'}</p>
        <Link href="/games" className="mt-4 inline-block text-sm text-white/50 hover:text-white">
          ← К играм
        </Link>
      </Message>
    );

  const { session, graph } = game;
  const step = session.step;
  const done = step.status === 'completed' || step.node.type === 'end';
  const title = game.meta?.storyTitle ?? graph.story.title ?? 'Игра';
  const name = game.meta?.name ?? 'Прохождение';
  const progress = session.history.length;
  const variablesCount = Object.keys(session.variables).length;

  async function handleSaveSlot(slot: SaveSlot) {
    const existing = slots.slots[slot];
    if (
      existing &&
      existing.state.playthroughId !== playthroughId &&
      !confirm(`Слот ${slot} занят другим прохождением. Перезаписать?`)
    )
      return;
    const ok = await slots.save(slot, {
      state: session.step,
      variables: session.variables,
      history: session.history,
      savedAt: new Date().toISOString(),
    });
    show(ok ? `Слот ${slot} сохранён` : 'Не удалось сохранить слот', 1400);
  }

  function handleLoadSlot(slot: SaveSlot) {
    const snapshot = slots.slots[slot];
    if (!snapshot) return;
    const problem = game.restore(snapshot);
    if (problem) {
      show(problem, 2500);
      return;
    }
    setPanel('none');
    setMenuOpen(false);
    show(`Слот ${slot} загружен`, 1400);
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#08090b] text-white selection:bg-white/20">
      <div className="game-atmosphere" aria-hidden="true" />
      <GameHeader
        title={title}
        name={name}
        progress={progress}
        flash={flash}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        onOpenPanel={setPanel}
      />

      <section className="relative mx-auto flex min-h-[calc(100dvh-8rem)] max-w-7xl items-center px-3 py-5 sm:px-8 sm:py-10">
        <div
          className={`game-shell ${transition} w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#111215]/90 shadow-2xl`}
        >
          <div className="grid min-h-[650px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <GameStage
              key={step.node.id}
              step={step}
              done={done}
              progress={progress}
              actionError={game.actionError}
              inputEnabled={panel === 'none' && !menuOpen}
              onChoose={game.choose}
            />
            <GameSidebar
              name={name}
              progress={progress}
              variablesCount={variablesCount}
              done={done}
            />
          </div>
          <div className="border-t border-white/10 px-6 py-3 text-[10px] uppercase tracking-[0.12em] text-white/20 sm:px-10">
            Crossroad Runtime · локальное прохождение MVP
          </div>
        </div>
      </section>

      {panel !== 'none' && (
        <GamePanel title={PANEL_TITLES[panel]} onClose={() => setPanel('none')}>
          {panel === 'save' && (
            <SavePanel
              playthroughId={playthroughId}
              slots={slots.slots}
              error={slots.error}
              onSave={(slot) => void handleSaveSlot(slot)}
              onLoad={handleLoadSlot}
              onDelete={(slot) => {
                if (confirm(`Удалить слот ${slot}?`)) void slots.remove(slot);
              }}
            />
          )}
          {panel === 'history' && <HistoryPanel history={session.history} graph={graph} />}
          {panel === 'variables' && (
            <VariablesPanel variables={session.variables} onChange={game.changeVariable} />
          )}
        </GamePanel>
      )}
    </main>
  );
}
