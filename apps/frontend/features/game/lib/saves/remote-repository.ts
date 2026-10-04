import type { GameSavesRepository } from './types';

const notImplemented = (method: string) =>
  new Error(`Сохранения в БД ещё не реализованы (${method}).`);

export const remoteGameSavesRepository: GameSavesRepository = {
  async list() {
    throw notImplemented('list');
  },
  async get() {
    throw notImplemented('get');
  },
  async upsert() {
    throw notImplemented('upsert');
  },
  async remove() {
    throw notImplemented('remove');
  },
  async listSlots() {
    throw notImplemented('listSlots');
  },
  async saveSlot() {
    throw notImplemented('saveSlot');
  },
  async deleteSlot() {
    throw notImplemented('deleteSlot');
  },
};
