'use client';

import { formatSlotDate } from '@/features/game/lib/format';
import type { GameSaveSlots, SaveSlot } from '@/features/game/lib/saves';

const SLOT_LIST: SaveSlot[] = [1, 2, 3];

type Props = {
  playthroughId: string;
  slots: GameSaveSlots;
  error: string;
  onSave: (slot: SaveSlot) => void;
  onLoad: (slot: SaveSlot) => void;
  onDelete: (slot: SaveSlot) => void;
};

export function SavePanel({ playthroughId, slots, error, onSave, onLoad, onDelete }: Props) {
  return (
    <div className="mt-6 space-y-3">
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      {SLOT_LIST.map((slot) => {
        const item = slots[slot];
        // слоты общие на браузер: слот другого прохождения здесь загрузить нельзя
        const foreign = !!item && item.state.playthroughId !== playthroughId;
        return (
          <div key={slot} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Слот {slot}</div>
                <div className="mt-1 text-xs text-white/35">
                  {item ? formatSlotDate(item.savedAt) : 'Пустой слот'}
                  {foreign && <span className="ml-2 text-amber-300/80">· другое прохождение</span>}
                </div>
              </div>
              {item && (
                <button
                  onClick={() => onDelete(slot)}
                  className="text-xs text-red-300/60 hover:text-red-300"
                >
                  Удалить
                </button>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              {item && (
                <button
                  disabled={foreign}
                  onClick={() => onLoad(slot)}
                  className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Загрузить
                </button>
              )}
              <button
                onClick={() => onSave(slot)}
                className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-medium text-black hover:bg-white/90"
              >
                {item ? 'Перезаписать' : 'Сохранить'}
              </button>
            </div>
          </div>
        );
      })}
      <p className="pt-2 text-xs leading-5 text-white/30">
        Autosave обновляется после каждого выбора. Ручные слоты переживают перезагрузку страницы.
      </p>
    </div>
  );
}
