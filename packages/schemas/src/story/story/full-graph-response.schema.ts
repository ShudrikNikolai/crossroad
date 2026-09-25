import { z } from 'zod';
import { StoryResponseSchema } from './get.schema.js';
import { NodeResponseSchema } from '../node/get.schema.js';
import { EdgeResponseSchema } from '../edge/get.schema.js';
import { VariableResponseSchema } from '../variable/get.schema.js';

export const FullGraphResponseSchema = z.object({
  story: StoryResponseSchema,
  nodes: z.array(NodeResponseSchema),
  edges: z.array(EdgeResponseSchema),
  variables: z.array(VariableResponseSchema),
});

export type TFullGraphResponse = z.infer<typeof FullGraphResponseSchema>;
