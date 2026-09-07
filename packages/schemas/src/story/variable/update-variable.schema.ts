import { z } from 'zod';
import { VariableTypeSchema } from './create-variable.schema.js';

// key и storyId неизменяемы после создания — переименование переменной
// сломает все edge.conditions, которые на неё ссылаются
// TODO расширить и переписать нормально потом
export const UpdateVariableSchema = z.object({
  type: VariableTypeSchema.optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export type TUpdateVariableSchema = z.infer<typeof UpdateVariableSchema>;
