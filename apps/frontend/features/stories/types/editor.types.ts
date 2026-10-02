import type { Edge, Node, XYPosition } from '@xyflow/react';
import type {
  NodeType,
  StoryEdge,
  StoryNode,
  StoryVariable,
} from '@/features/stories/types/story.types';

export type FlowNodeData = {
  storyNode: StoryNode;
  isStart: boolean;
  isEditing: boolean;
  outgoingEdges: StoryEdge[];
  variables: StoryVariable[];
};
export type FlowNode = Node<FlowNodeData, 'story'>;

export type FlowEdgeData = {
  storyEdge: StoryEdge;
  isEditing: boolean;
};
export type FlowEdge = Edge<FlowEdgeData, 'story'>;

export type HistoryAction = {
  label: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
};

export type ContextMenuState = {
  x: number;
  y: number;
  flowPosition: XYPosition;
  nodeId?: string;
  edgeId?: string;
};

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

/** Частичное изменение узла: content мёржится с актуальным значением из graph. */
export type NodePatch = { type?: NodeType; content?: Partial<StoryNode['content']> };
export type EdgePatch = Partial<Pick<StoryEdge, 'label' | 'conditions'>>;

/** Стабильные действия редактора: ноды/рёбра берут их из контекста, а не из data. */
export type EditorActions = {
  startEditNode: (id: string) => void;
  patchNode: (id: string, patch: NodePatch) => void;
  commitNode: (id: string) => void;
  startEditEdge: (id: string) => void;
  patchEdge: (id: string, patch: EdgePatch) => void;
  commitEdge: (id: string) => void;
  addCondition: (edgeId: string) => void;
  selectEdge: (id: string) => void;
  deleteEdge: (id: string) => void;
};

export type VariableDraft = { key: string; type: 'string' | 'number' | 'boolean'; value: string };
