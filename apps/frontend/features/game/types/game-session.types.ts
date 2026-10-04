import type { GameVariables } from '@/features/game/lib/local-runtime';
import type { GameStep } from '@/features/game/types/game.types';

/** Шаг, переменные и история меняются атомарно — не бывает рассинхрона между ними. */
export type GameSession = {
  step: GameStep;
  variables: GameVariables;
  history: string[];
};

export type GameMeta = { name: string; storyTitle: string };

export type GamePanelId = 'none' | 'save' | 'history' | 'variables';
