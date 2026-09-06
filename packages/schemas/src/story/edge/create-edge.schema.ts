import { z } from 'zod';

export const ConditionOperatorSchema = z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte']);

export const EdgeConditionSchema = z.object({
  variableKey: z.string().min(1),
  operator: ConditionOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const CreateEdgeSchema = z.object({
  storyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  id: z.string().min(1),
  source: z.string().min(1), // id узла-источника
  target: z.string().min(1), // id узла-назначения
  label: z.string().trim().max(200).optional(), // текст выбора для игрока
  conditions: z.array(EdgeConditionSchema).optional(), // AND-логика между условиями
});

export type TCreateEdgeSchema = z.infer<typeof CreateEdgeSchema>;
export type TEdgeCondition = z.infer<typeof EdgeConditionSchema>;
