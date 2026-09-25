import { z } from 'zod';
import { CreateEdgeSchema } from './create.schema.js';

export const UpdateEdgeSchema = CreateEdgeSchema.omit({ id: true }).partial();

export type TUpdateEdgeSchema = z.infer<typeof UpdateEdgeSchema>;
