import { localGameSavesRepository } from './local-repository';
import { remoteGameSavesRepository } from './remote-repository';
import type { GameSavesRepository } from './types';

/** NEXT_PUBLIC_GAME_SAVES=remote включает хранение в БД; по умолчанию — localStorage. */
const mode = process.env.NEXT_PUBLIC_GAME_SAVES === 'remote' ? 'remote' : 'local';

export const gameSaves: GameSavesRepository =
  mode === 'remote' ? remoteGameSavesRepository : localGameSavesRepository;

export type { GameSave, GameSaveSlots, GameSavesRepository, GameSnapshot, SaveSlot } from './types';
