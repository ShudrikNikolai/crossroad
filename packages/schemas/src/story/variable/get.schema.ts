import { z } from 'zod';
import { VariableTypeSchema } from './create.schema.js';

export const VariableResponseSchema = z.object({
  storyId: z.string(),
  key: z.string(),
  type: VariableTypeSchema,
  defaultValue: z.union([z.string(), z.number(), z.boolean()]),
}).meta({ id: 'VariableResponse' });

export type TVariableResponse = z.infer<typeof VariableResponseSchema>;
