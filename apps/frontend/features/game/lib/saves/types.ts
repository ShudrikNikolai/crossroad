import type {
  LocalGameSave,
  LocalGameSnapshot,
  LocalSaveSlots,
  SaveSlot,
} from '@/features/game/lib/local-storage';

export type GameSave = LocalGameSave;
export type GameSnapshot = LocalGameSnapshot;
export type GameSaveSlots = LocalSaveSlots;
export type { SaveSlot };

/**
 * Единый интерфейс хранения прохождений. Весь UI работает только через него,
 * поэтому переезд с localStorage на БД = новая реализация, без правок страниц.
 * Методы асинхронные специально: для сервера они всё равно будут асинхронными.
 */
export interface GameSavesRepository {
  list(): Promise<GameSave[]>;
  get(playthroughId: string): Promise<GameSave | null>;
  upsert(save: GameSave): Promise<void>;
  remove(playthroughId: string): Promise<void>;

  listSlots(playthroughId: string): Promise<GameSaveSlots>;
  saveSlot(playthroughId: string, slot: SaveSlot, snapshot: GameSnapshot): Promise<void>;
  deleteSlot(playthroughId: string, slot: SaveSlot): Promise<void>;
}
