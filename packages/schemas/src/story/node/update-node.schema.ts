import { z } from 'zod';
import { CreateNodeSchema } from './create-node.schema';

export const UpdateNodeSchema = CreateNodeSchema.omit({
  storyId: true,
  id: true,
}).partial();

export type TUpdateNodeSchema = z.infer<typeof UpdateNodeSchema>;
