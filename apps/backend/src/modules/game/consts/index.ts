export const GAME_EVENTS = {
  NODE_PLAYED: 'story.node.played',
  STORY_COMPLETED: 'story.completed',
} as const;

export const PUBLISHED_GRAPH_CACHE_PREFIX = 'story:published:';
export const PUBLISHED_GRAPH_CACHE_TTL_SECONDS = 60 * 60 * 24;
