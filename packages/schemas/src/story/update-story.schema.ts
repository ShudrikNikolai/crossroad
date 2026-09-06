import { z } from 'zod';
import { CreateStorySchema } from './create-story.schema';

export const StoryStatusSchema = z.enum(['draft', 'published']);

export const UpdateStorySchema = CreateStorySchema.partial().extend({
  status: StoryStatusSchema.optional(),
  startNodeId: z.string().optional(),
});

export type TUpdateStorySchema = z.infer<typeof UpdateStorySchema>;
export type TStoryStatus = z.infer<typeof StoryStatusSchema>;
