import {
  autoResolveConditions,
  stepFromNode,
  type GameVariables,
} from '@/features/game/lib/local-runtime';
import type { StoryGraph } from '@/features/stories/types/story.types';
import type { PlaytestSession, StoredPlaytest } from '@/features/stories/types/playtest.types';

export const HISTORY_LIMIT = 100;

export function defaultVariables(graph: StoryGraph): GameVariables {
  return Object.fromEntries(graph.variables.map((variable) => [variable.key, variable.defaultValue]));
}

/**
 * Берём из сохранения только существующие переменные с подходящим типом,
 * всё остальное — значения по умолчанию (граф мог измениться с прошлого запуска).
 */
export function sanitizeVariables(graph: StoryGraph, saved: GameVariables = {}): GameVariables {
  const result = defaultVariables(graph);
  for (const variable of graph.variables) {
    const value = saved[variable.key];
    if (typeof value !== variable.type) continue;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    result[variable.key] = value;
  }
  return result;
}

/**
 * Собирает сессию из графа и (необязательно) сохранения.
 * Если сохранённый узел удалён — откатываемся на стартовый, а не зависаем с пустым экраном.
 */
export function createSession(
  graph: StoryGraph,
  playthroughId: string,
  stored: StoredPlaytest | null,
): PlaytestSession | null {
  const ids = new Set(graph.nodes.map((node) => node.id));
  const startId = graph.story.startNodeId;

  const restored = !!stored && ids.has(stored.nodeId);
  const nodeId = restored ? stored.nodeId : startId && ids.has(startId) ? startId : null;
  if (!nodeId) return null;

  const variables = sanitizeVariables(graph, stored?.variables);
  const step = stepFromNode(graph, nodeId, variables, playthroughId);
  if (!step) return null;

  const history = restored
    ? stored.history.filter((id) => ids.has(id)).slice(-HISTORY_LIMIT)
    : [];

  return { step: autoResolveConditions(graph, step, variables), variables, history };
}
