import type { NodeType, StoryNodeContent } from '@/features/stories/types/story.types';

export type GameStatus = 'in_progress' | 'completed';

export interface GameNode {
  id: string;
  type: NodeType;
  content: StoryNodeContent;
}

export interface GameChoice {
  edgeId: string;
  label?: string;
}

export interface GameStep {
  playthroughId: string;
  status: GameStatus;
  node: GameNode;
  choices: GameChoice[];
}

export interface CreateGameRequest {
  storyId: string;
  name: string;
}

export interface NextGameStepRequest {
  edgeId: string;
}
