import { z } from 'zod';

export const UpdateGameNextStepSchema = z.object({
  playthroughId: z.string().min(1),
  edgeId: z.string().min(1), // выбор игрока — конкретный edge
});

export type TUpdateGameNextStepSchema = z.infer<typeof UpdateGameNextStepSchema>;
