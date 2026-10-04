import type { StoryGraph, StoryVariable } from '@/features/stories/types/story.types';
import type { GameStep } from '@/features/game/types/game.types';
import type { GameVariables } from './local-runtime';

export type { GameVariables } from './local-runtime';
export {
  advanceLocalGame,
  autoResolveConditions,
  edgeMatches,
  getAvailableEdges,
  stepFromNode,
} from './local-runtime';

export interface LocalGameSave {
  playthroughId: string;
  storyId: string;
  storyTitle: string;
  name: string;
  state: GameStep;
  variables: GameVariables;
  history: string[];
  createdAt: string;
  updatedAt: string;
}

export type SaveSlot = 1 | 2 | 3;

export interface LocalGameSnapshot {
  state: GameStep;
  variables: GameVariables;
  history: string[];
  savedAt: string;
}

export type LocalSaveSlots = Partial<Record<SaveSlot, LocalGameSnapshot>>;

const SAVES_KEY = 'crossroad:game:saves';
const SLOTS_KEY = 'crossroad:game:slots';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

function isSave(value: unknown): value is LocalGameSave {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<LocalGameSave>;

  return (
    typeof item.playthroughId === 'string' &&
    typeof item.storyId === 'string' &&
    typeof item.storyTitle === 'string' &&
    typeof item.name === 'string' &&
    !!item.state &&
    typeof item.state === 'object' &&
    typeof item.updatedAt === 'string'
  );
}

export function listLocalGameSaves(): LocalGameSave[] {
  const stored = readJson<unknown>(SAVES_KEY, []);

  if (!Array.isArray(stored)) return [];

  return stored.filter(isSave);
}

export function getLocalGameSave(
  playthroughId: string,
): LocalGameSave | null {
  return (
    listLocalGameSaves().find(
      (save) => save.playthroughId === playthroughId,
    ) ?? null
  );
}

export function upsertLocalGameSave(save: LocalGameSave): void {
  const saves = listLocalGameSaves();
  const index = saves.findIndex(
    (item) => item.playthroughId === save.playthroughId,
  );

  if (index === -1) {
    saves.push(save);
  } else {
    saves[index] = save;
  }

  writeJson(SAVES_KEY, saves);
}

export function deleteLocalGameSave(playthroughId: string): void {
  const saves = listLocalGameSaves().filter(
    (save) => save.playthroughId !== playthroughId,
  );

  writeJson(SAVES_KEY, saves);
}

export function listGameSlots(): LocalSaveSlots {
  const stored = readJson<unknown>(SLOTS_KEY, {});

  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {};
  }

  const result: LocalSaveSlots = {};

  for (const slot of [1, 2, 3] as const) {
    const value = (stored as Record<string, unknown>)[String(slot)];

    if (
      value &&
      typeof value === 'object' &&
      'state' in value &&
      'variables' in value &&
      'history' in value &&
      'savedAt' in value
    ) {
      result[slot] = value as LocalGameSnapshot;
    }
  }

  return result;
}

export function saveGameSlot(
  slot: SaveSlot,
  snapshot: LocalGameSnapshot,
): void {
  const slots = listGameSlots();
  slots[slot] = snapshot;
  writeJson(SLOTS_KEY, slots);
}

export function deleteGameSlot(slot: SaveSlot): void {
  const slots = listGameSlots();
  delete slots[slot];
  writeJson(SLOTS_KEY, slots);
}

export function buildDefaultVariables(
  variables: StoryVariable[],
): GameVariables {
  return Object.fromEntries(
    variables.map((variable) => [
      variable.key,
      variable.defaultValue,
    ]),
  ) as GameVariables;
}
