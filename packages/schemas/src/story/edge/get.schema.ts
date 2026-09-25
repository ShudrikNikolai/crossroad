import { z } from 'zod';
import { EdgeConditionSchema } from './create.schema.js';

export const EdgeResponseSchema = z.object({
  storyId: z.string(),
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  conditions: z.array(EdgeConditionSchema).optional(),
});

export type TEdgeResponse = z.infer<typeof EdgeResponseSchema>;
