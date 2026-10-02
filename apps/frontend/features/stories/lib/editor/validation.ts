import type { StoryEdge, StoryGraph } from '@/features/stories/types/story.types';
import { nodeTitle } from './helpers';

export const EMPTY_VALIDATION = { errors: [] as string[], warnings: [] as string[] };

/** Один проход по узлам и рёбрам */
export function validateGraph(graph: StoryGraph) {
  const errors: string[] = [];
  const warnings: string[] = [];

  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const startId = graph.story.startNodeId;
  if (!startId || !nodeIds.has(startId)) errors.push('Не задан корректный стартовый узел.');

  const incoming = new Set<string>();
  const bySource = new Map<string, StoryEdge[]>();
  for (const edge of graph.edges) {
    incoming.add(edge.target);
    const list = bySource.get(edge.source);
    if (list) list.push(edge);
    else bySource.set(edge.source, [edge]);
  }

  for (const node of graph.nodes) {
    if (node.id !== startId && !incoming.has(node.id))
      warnings.push(`Узел «${nodeTitle(node)}» недостижим из других узлов.`);

    const branches = bySource.get(node.id) ?? [];
    if (node.type === 'choice' && !branches.length)
      warnings.push(`Выбор «${nodeTitle(node)}» не имеет вариантов.`);

    if (node.type === 'condition') {
      if (!branches.length) warnings.push(`Условие «${nodeTitle(node)}» не имеет веток.`);
      for (const edge of branches) {
        if (!edge.conditions?.length)
          warnings.push(`Ветка «${edge.label || edge.id}» у условия не содержит условий.`);
      }
    }
  }
  return { errors, warnings };
}

/** Связи, чьи source/target отсутствуют среди узлов (мусор в БД). */
export function findOrphanEdges(graph: StoryGraph) {
  const ids = new Set(graph.nodes.map((node) => node.id));
  return graph.edges.filter((edge) => !ids.has(edge.source) || !ids.has(edge.target));
}
