import type {
  StoryCondition,
  StoryEdge,
  StoryGraph,
} from '@/features/stories/types/story.types';
import type {
  GameChoice,
  GameNode,
  GameStep,
} from '@/features/game/types/game.types';
import { selectAvailableEdges } from './edge-rules';

export type GameVariables = Record<string, string | number | boolean>;

function compare(
  left: string | number | boolean | undefined,
  condition: StoryCondition,
): boolean {
  if (left === undefined) return false;

  const right = condition.value;

  switch (condition.operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'gt':
      return typeof left === 'number' && typeof right === 'number' && left > right;
    case 'gte':
      return typeof left === 'number' && typeof right === 'number' && left >= right;
    case 'lt':
      return typeof left === 'number' && typeof right === 'number' && left < right;
    case 'lte':
      return typeof left === 'number' && typeof right === 'number' && left <= right;
    default:
      return false;
  }
}

export function edgeMatches(edge: StoryEdge, variables: GameVariables): boolean {
  return (edge.conditions ?? []).every((condition) =>
    compare(variables[condition.variableKey], condition),
  );
}

/**
 * Возвращает доступные переходы узла с теми же правилами,
 * которые используются на сервере.
 */
export function getAvailableEdges(
  graph: StoryGraph,
  nodeId: string,
  variables: GameVariables,
): StoryEdge[] {
  const nodeType = graph.nodes.find((node) => node.id === nodeId)?.type;
  const outgoing = graph.edges.filter((edge) => edge.source === nodeId);

  return selectAvailableEdges(
    nodeType,
    outgoing,
    (edge) => edgeMatches(edge, variables),
  );
}

function toGameNode(graph: StoryGraph, nodeId: string): GameNode | null {
  const node = graph.nodes.find((item) => item.id === nodeId);

  if (!node) return null;

  return {
    id: node.id,
    type: node.type,
    content: node.content,
  };
}

export function stepFromNode(
  graph: StoryGraph,
  nodeId: string,
  variables: GameVariables,
  playthroughId: string,
): GameStep | null {
  const node = toGameNode(graph, nodeId);

  if (!node) return null;

  if (node.type === 'end') {
    return {
      playthroughId,
      status: 'completed',
      node,
      choices: [],
    };
  }

  const edges = getAvailableEdges(graph, nodeId, variables);

  const choices: GameChoice[] = edges.map((edge) => ({
    edgeId: edge.id,
    label: edge.label,
  }));

  return {
    playthroughId,
    status: 'in_progress',
    node,
    choices,
  };
}

/**
 * Локальный переход использует те же ограничения,
 * что и серверный nextStep: перейти можно только по доступному edge.
 */
export function advanceLocalGame(
  graph: StoryGraph,
  state: GameStep,
  edgeId: string,
  variables: GameVariables,
): GameStep | null {
  const edge = getAvailableEdges(
    graph,
    state.node.id,
    variables,
  ).find((item) => item.id === edgeId);

  if (!edge) return null;

  return stepFromNode(
    graph,
    edge.target,
    variables,
    state.playthroughId,
  );
}

/**
 * Автоматически проходит цепочку condition-узлов,
 * пока для каждого из них определяется ровно одна ветка.
 */
export function autoResolveConditions(
  graph: StoryGraph,
  state: GameStep,
  variables: GameVariables,
): GameStep {
  let current = state;
  const visited = new Set<string>();

  while (current.node.type === 'condition') {
    if (visited.has(current.node.id)) return current;

    visited.add(current.node.id);

    const choices = getAvailableEdges(
      graph,
      current.node.id,
      variables,
    );

    if (choices.length !== 1) return current;

    const next = stepFromNode(
      graph,
      choices[0].target,
      variables,
      current.playthroughId,
    );

    if (!next) return current;

    current = next;
  }

  return current;
}
