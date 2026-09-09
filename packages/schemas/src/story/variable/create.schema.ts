import { z } from 'zod';

export const VariableTypeSchema = z.enum(['string', 'number', 'boolean']);

export const CreateVariableSchema = z.object({
  storyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  key: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Must be a valid identifier'),
  type: VariableTypeSchema,
  defaultValue: z.union([z.string(), z.number(), z.boolean()]),
}).refine(
  (data) => typeof data.defaultValue === (
    data.type === 'string' ? 'string' : data.type === 'number' ? 'number' : 'boolean'
  ),
  { message: 'defaultValue type must match declared type', path: ['defaultValue'] },
);

export type TCreateVariableSchema = z.infer<typeof CreateVariableSchema>;
export type TVariableType = z.infer<typeof VariableTypeSchema>;
