'use client';

export function GameSidebar({
  name,
  progress,
  variablesCount,
  done,
}: {
  name: string;
  progress: number;
  variablesCount: number;
  done: boolean;
}) {
  return (
    <aside className="hidden border-l border-white/10 bg-black/10 p-6 lg:flex lg:flex-col">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/25">Прохождение</div>
      <div className="mt-2 text-lg font-medium">{name}</div>
      <div className="mt-6 h-px bg-white/10" />
      <div className="mt-6 space-y-5">
        <div>
          <div className="text-xs text-white/30">История</div>
          <div className="mt-1 text-sm text-white/70">{progress} посещённых узлов</div>
        </div>
        <div>
          <div className="text-xs text-white/30">Переменные</div>
          <div className="mt-1 text-sm text-white/70">{variablesCount}</div>
        </div>
        <div>
          <div className="text-xs text-white/30">Состояние</div>
          <div className="mt-1 text-sm text-emerald-300/80">{done ? 'Завершено' : 'В процессе'}</div>
        </div>
      </div>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-white/30">
        Пробел / Enter — показать текст
        <br />
        1–9 — выбор
        <br />S — сохранения · H — история
      </div>
    </aside>
  );
}
