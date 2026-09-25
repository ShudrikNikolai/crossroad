import { z } from 'zod';

export const UpdateGameNextStepSchema = z.object({
  edgeId: z.string().min(1),
});

export type TUpdateGameNextStepSchema = z.infer<typeof UpdateGameNextStepSchema>;
