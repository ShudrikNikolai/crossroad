import type { StoryGraph, StoryEdge, StoryCondition } from '../types/story.types';

export type StoryIssueSeverity = 'error' | 'warning';
export interface StoryIssue {
  severity: StoryIssueSeverity;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

function conditionText(condition: StoryCondition) {
  return `${condition.variableKey} ${condition.operator} ${String(condition.value)}`;
}

export function validateStory(graph: StoryGraph): StoryIssue[] {
  const issues: StoryIssue[] = [];
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  const variableMap = new Map(graph.variables.map((variable) => [variable.key, variable]));

  if (!graph.nodes.length)
    issues.push({ severity: 'error', message: 'В истории нет ни одного узла.' });
  if (!graph.story.startNodeId)
    issues.push({ severity: 'error', message: 'Не задан стартовый узел.' });
  else if (!nodeIds.has(graph.story.startNodeId))
    issues.push({
      severity: 'error',
      message: 'Стартовый узел не существует.',
      nodeId: graph.story.startNodeId,
    });

  const outgoing = new Map<string, StoryEdge[]>();
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source))
      issues.push({
        severity: 'error',
        message: `Связь ${edge.id} ссылается на отсутствующий source.`,
        edgeId: edge.id,
      });
    if (!nodeIds.has(edge.target))
      issues.push({
        severity: 'error',
        message: `Связь ${edge.id} ссылается на отсутствующий target.`,
        edgeId: edge.id,
      });
    const list = outgoing.get(edge.source) ?? [];
    list.push(edge);
    outgoing.set(edge.source, list);
    for (const condition of edge.conditions ?? []) {
      const variable = variableMap.get(condition.variableKey);
      if (!variable) {
        issues.push({
          severity: 'error',
          message: `Условие использует неизвестную переменную «${condition.variableKey}».`,
          edgeId: edge.id,
        });
        continue;
      }
      if (variable.type === 'number' && typeof condition.value !== 'number')
        issues.push({
          severity: 'error',
          message: `Значение ${conditionText(condition)} должно быть числом.`,
          edgeId: edge.id,
        });
      if (variable.type === 'boolean' && typeof condition.value !== 'boolean')
        issues.push({
          severity: 'error',
          message: `Значение ${conditionText(condition)} должно быть boolean.`,
          edgeId: edge.id,
        });
      if (variable.type === 'string' && typeof condition.value !== 'string')
        issues.push({
          severity: 'error',
          message: `Значение ${conditionText(condition)} должно быть строкой.`,
          edgeId: edge.id,
        });
    }
  }

  for (const node of graph.nodes) {
    const edges = outgoing.get(node.id) ?? [];
    if (node.type === 'choice' && edges.length === 0)
      issues.push({
        severity: 'error',
        message: 'Choice не имеет ни одного варианта.',
        nodeId: node.id,
      });
    if (node.type === 'condition') {
      if (edges.length === 0)
        issues.push({
          severity: 'error',
          message: 'Condition не имеет исходящих веток.',
          nodeId: node.id,
        });
      const elseEdges = edges.filter((edge) => !edge.conditions?.length);
      if (elseEdges.length > 1)
        issues.push({
          severity: 'error',
          message: 'Condition содержит больше одной ELSE-ветки.',
          nodeId: node.id,
        });
      if (edges.length > 0 && elseEdges.length === 0)
        issues.push({
          severity: 'warning',
          message:
            'Condition не имеет ELSE-ветки. Если ни одно условие не выполнится, прохождение может остановиться.',
          nodeId: node.id,
        });
    }
  }

  if (graph.story.startNodeId && nodeIds.has(graph.story.startNodeId)) {
    const reachable = new Set<string>([graph.story.startNodeId]);
    const queue = [graph.story.startNodeId];
    while (queue.length) {
      const id = queue.shift()!;
      for (const edge of outgoing.get(id) ?? [])
        if (nodeIds.has(edge.target) && !reachable.has(edge.target)) {
          reachable.add(edge.target);
          queue.push(edge.target);
        }
    }
    for (const node of graph.nodes)
      if (!reachable.has(node.id))
        issues.push({
          severity: 'warning',
          message: 'Узел недостижим от стартового узла.',
          nodeId: node.id,
        });
  }

  return issues;
}
