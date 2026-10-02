import type { GameVariables } from '@/features/game/lib/local-runtime';
import type { GameStep } from '@/features/game/types/game.types';

/** Текущая сессия playtest: шаг, переменные и пройденные узлы меняются атомарно. */
export type PlaytestSession = {
  step: GameStep;
  variables: GameVariables;
  history: string[];
};

/** То, что лежит в localStorage. */
export type StoredPlaytest = {
  nodeId: string;
  variables: GameVariables;
  history: string[];
};
