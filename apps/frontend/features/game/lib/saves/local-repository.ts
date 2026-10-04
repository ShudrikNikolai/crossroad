import {
  deleteGameSlot,
  deleteLocalGameSave,
  getLocalGameSave,
  listGameSlots,
  listLocalGameSaves,
  saveGameSlot,
  upsertLocalGameSave,
} from '@/features/game/lib/local-storage';
import type { GameSavesRepository } from './types';

export const localGameSavesRepository: GameSavesRepository = {
  async list() {
    return listLocalGameSaves();
  },
  async get(playthroughId) {
    return getLocalGameSave(playthroughId);
  },
  async upsert(save) {
    upsertLocalGameSave(save);
  },
  async remove(playthroughId) {
    deleteLocalGameSave(playthroughId);
  },

  async listSlots() {
    return listGameSlots();
  },
  async saveSlot(_playthroughId, slot, snapshot) {
    saveGameSlot(slot, snapshot);
  },
  async deleteSlot(_playthroughId, slot) {
    deleteGameSlot(slot);
  },
};
