import { z } from 'zod';

export const createGameSchema = z.object({
  name: z.string().trim().min(1).max(128),
  storyId: z.string().trim().min(1).max(128),
});

export type TCreateGameSchema = z.infer<
  typeof createGameSchema
>;
