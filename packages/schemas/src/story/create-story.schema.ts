import { z } from 'zod';

export const CreateStorySchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
});

export type TCreateStorySchema = z.infer<typeof CreateStorySchema>;
