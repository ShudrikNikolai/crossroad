import type { NodeType, StoryNode } from '@/features/stories/types/story.types';
import { nodeMeta } from './constants';

export function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function branchHandleId(edgeId: string) {
  return `out-${edgeId}`;
}

/** Название блока: своё или тип как запасной вариант для старых узлов. */
export const nodeTitle = (node: StoryNode) => node.content.title?.trim() || nodeMeta[node.type].label;

/** "Сцена 1", "Сцена 2"… — следующий свободный номер для типа. */
export function nextTitle(type: NodeType, nodes: StoryNode[]) {
  const label = nodeMeta[type].label;
  const re = new RegExp(`^${label} (\\d+)$`);
  const max = nodes.reduce((m, n) => {
    const r = re.exec(n.content.title ?? '');
    return r ? Math.max(m, Number(r[1])) : m;
  }, 0);
  return `${label} ${max + 1}`;
}

export const sameArray = <T,>(a: T[], b: T[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

/** Показываем причину с сервера, если она есть. */
export const errorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? `${fallback} ${error.message}` : fallback;
