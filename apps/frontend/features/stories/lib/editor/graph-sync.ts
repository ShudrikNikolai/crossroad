import type { StoryEdge, StoryGraph } from '@/features/stories/types/story.types';
import { EMPTY_EDGES, MARKER, isBranching } from './constants';
import { branchHandleId, sameArray } from './helpers';
import type { FlowEdge, FlowNode } from '@/features/stories/types/editor.types';

/**
 * graph -> узлы React Flow.
 * Неизменившиеся узлы возвращаются тем же объектом, поэтому memo реально работает,
 * а selected/measured не сбрасываются.
 */
export function syncFlowNodes(
  prev: FlowNode[],
  graph: StoryGraph,
  editingNodeId: string | null,
): FlowNode[] {
  const outgoing = new Map<string, StoryEdge[]>();
  for (const edge of graph.edges) {
    const list = outgoing.get(edge.source);
    if (list) list.push(edge);
    else outgoing.set(edge.source, [edge]);
  }

  const prevById = new Map(prev.map((node) => [node.id, node]));
  return graph.nodes.map((storyNode) => {
    const old = prevById.get(storyNode.id);
    const oldData = old?.data;
    const isStart = graph.story.startNodeId === storyNode.id;
    const isEditing = editingNodeId === storyNode.id;
    const fresh = outgoing.get(storyNode.id) ?? EMPTY_EDGES;
    const out = oldData && sameArray(oldData.outgoingEdges, fresh) ? oldData.outgoingEdges : fresh;

    if (
      old &&
      oldData &&
      oldData.storyNode === storyNode &&
      oldData.isStart === isStart &&
      oldData.isEditing === isEditing &&
      oldData.variables === graph.variables &&
      oldData.outgoingEdges === out
    )
      return old;

    return {
      ...old,
      id: storyNode.id,
      type: 'story',
      position: old?.position ?? storyNode.position,
      data: { storyNode, isStart, isEditing, outgoingEdges: out, variables: graph.variables },
    } as FlowNode;
  });
}

/** graph -> рёбра React Flow. Handle зависит от типа узла-источника (у scene/end он "out"). */
export function syncFlowEdges(
  prev: FlowEdge[],
  graph: StoryGraph,
  editingEdgeId: string | null,
): FlowEdge[] {
  const prevById = new Map(prev.map((edge) => [edge.id, edge]));
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

  return graph.edges.map((storyEdge) => {
    const old = prevById.get(storyEdge.id);
    const isEditing = editingEdgeId === storyEdge.id;
    const sourceHandle = isBranching(nodesById.get(storyEdge.source)?.type)
      ? branchHandleId(storyEdge.id)
      : 'out';

    if (
      old &&
      old.data &&
      old.data.storyEdge === storyEdge &&
      old.data.isEditing === isEditing &&
      old.sourceHandle === sourceHandle &&
      old.source === storyEdge.source &&
      old.target === storyEdge.target
    )
      return old;

    return {
      ...old,
      id: storyEdge.id,
      source: storyEdge.source,
      target: storyEdge.target,
      sourceHandle,
      targetHandle: 'in',
      type: 'story',
      markerEnd: MARKER,
      data: { storyEdge, isEditing },
    } as FlowEdge;
  });
}
