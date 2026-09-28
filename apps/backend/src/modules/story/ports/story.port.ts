export interface IStoryPort {
  assertEditable(storyId: string, authorId: string): Promise<void>;
  getPublishedGraph(storyId: string): Promise<{
    story: { id: string; startNodeId: string };
    nodes: Array<{ id: string; type: string; content: unknown }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
      conditions?: unknown[];
    }>;
    variables: Array<{ key: string; type: string; defaultValue: unknown }>;
  } | null>;
}

export const STORY_PORT = Symbol('STORY_PORT');
