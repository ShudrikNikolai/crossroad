'use client';

import type { ReactNode } from 'react';

/** Боковая панель поверх игры. Закрывается кликом по фону, крестиком и Escape (Escape обрабатывает GameScreen). */
export function GamePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="game-panel absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#111113] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            aria-label="Закрыть"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-white/40 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
