import { NodeContentSchema, NodeTypeSchema } from '../story/node/create.schema.js';
import { z } from 'zod';

export const PlaythroughStatusSchema = z.enum(['in_progress', 'completed']);

export const AvailableChoiceSchema = z.object({
  edgeId: z.string(),
  label: z.string().optional(),
});

export const GameStepResponseSchema = z.object({
  playthroughId: z.string(),
  status: PlaythroughStatusSchema,
  node: z.object({
    id: z.string(),
    type: NodeTypeSchema,
    content: NodeContentSchema,
  }),
  choices: z.array(AvailableChoiceSchema),
});

export type TGameStepResponse = z.infer<typeof GameStepResponseSchema>;
export type TPlaythroughStatus = z.infer<typeof PlaythroughStatusSchema>;
