import { z } from 'zod';
import { StoryStatusSchema } from './update.schema.js';

export const StoryResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  authorId: z.string(),
  status: StoryStatusSchema,
  startNodeId: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type TStoryResponse = z.infer<typeof StoryResponseSchema>;
