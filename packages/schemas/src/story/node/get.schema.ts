import { z } from 'zod';
import { NodeContentSchema, NodeTypeSchema, PositionSchema } from './create.schema.js';

export const NodeResponseSchema = z.object({
  storyId: z.string(),
  id: z.string(),
  type: NodeTypeSchema,
  position: PositionSchema,
  content: NodeContentSchema,
});

export type TNodeResponse = z.infer<typeof NodeResponseSchema>;
