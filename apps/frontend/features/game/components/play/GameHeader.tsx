'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { GamePanelId } from '@/features/game/types/game-session.types';

type Props = {
  title: string;
  name: string;
  progress: number;
  flash: string;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onOpenPanel: (panel: Exclude<GamePanelId, 'none'>) => void;
};

const ITEMS: { panel: Exclude<GamePanelId, 'none'>; label: string; hint?: string }[] = [
  { panel: 'save', label: 'Сохранения', hint: 'S' },
  { panel: 'history', label: 'История', hint: 'H' },
  { panel: 'variables', label: 'Переменные' },
];

export function GameHeader({
  title,
  name,
  progress,
  flash,
  menuOpen,
  onMenuOpenChange,
  onOpenPanel,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  // клик вне меню закрывает его
  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onMenuOpenChange(false);
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [menuOpen, onMenuOpenChange]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090a0c]/80 px-4 py-3 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/games"
            className="text-[10px] uppercase tracking-[0.22em] text-white/35 hover:text-white/60"
          >
            ← Игры
          </Link>
          <div className="mt-1 truncate text-sm font-medium">{title}</div>
        </div>
        <div className="hidden items-center gap-5 text-xs text-white/40 sm:flex">
          <span>{name}</span>
          <span>{progress} узлов</span>
          <span className="text-emerald-300/70">● {flash}</span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => onMenuOpenChange(!menuOpen)}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 transition hover:bg-white/10"
          >
            Меню
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 p-1 shadow-2xl backdrop-blur-xl"
            >
              {ITEMS.map((item) => (
                <button
                  key={item.panel}
                  role="menuitem"
                  onClick={() => {
                    onOpenPanel(item.panel);
                    onMenuOpenChange(false);
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  {item.label}
                  {item.hint && <span className="float-right text-white/30">{item.hint}</span>}
                </button>
              ))}
              <div className="my-1 border-t border-white/10" />
              <Link
                href="/games"
                role="menuitem"
                className="block rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/10"
              >
                Выйти к играм
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
