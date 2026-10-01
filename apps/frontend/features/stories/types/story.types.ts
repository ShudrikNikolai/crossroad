export type StoryStatus = 'draft' | 'published';
export type NodeType = 'scene' | 'choice' | 'condition' | 'end';
export type VariableType = 'string' | 'number' | 'boolean';
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';

export interface Story {
  id: string;
  title: string;
  description?: string;
  authorId: string;
  status: StoryStatus;
  startNodeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryNodeContent {
  text: string;
  speaker?: string;
  mediaKey?: string;
}

export interface StoryNode {
  storyId: string;
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  content: StoryNodeContent;
}

export interface StoryCondition {
  variableKey: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface StoryEdge {
  storyId: string;
  id: string;
  source: string;
  target: string;
  label?: string;
  conditions?: StoryCondition[];
}

export interface StoryVariable {
  storyId: string;
  key: string;
  type: VariableType;
  defaultValue: string | number | boolean;
}

export interface StoryGraph {
  story: Story;
  nodes: StoryNode[];
  edges: StoryEdge[];
  variables: StoryVariable[];
}

export interface CreateStoryRequest {
  title: string;
  description?: string;
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  status?: StoryStatus;
  startNodeId?: string;
}

export interface CreateNodeRequest {
  storyId: string;
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  content: StoryNodeContent;
}

export interface UpdateNodeRequest {
  type?: NodeType;
  position?: { x: number; y: number };
  content?: StoryNodeContent;
}

export interface CreateEdgeRequest {
  id: string;
  source: string;
  target: string;
  label?: string;
  conditions?: StoryCondition[];
}

export interface UpdateEdgeRequest {
  source?: string;
  target?: string;
  label?: string;
  conditions?: StoryCondition[];
}

export interface CreateVariableRequest {
  key: string;
  type: VariableType;
  defaultValue: string | number | boolean;
}
