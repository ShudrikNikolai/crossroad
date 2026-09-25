import { z } from 'zod';

export const ConditionOperatorSchema = z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte']);

export const EdgeConditionSchema = z.object({
  variableKey: z.string().min(1),
  operator: ConditionOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const CreateEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().trim().max(200).optional(),
  conditions: z.array(EdgeConditionSchema).optional(),
});

export type TCreateEdgeSchema = z.infer<typeof CreateEdgeSchema>;
export type TEdgeCondition = z.infer<typeof EdgeConditionSchema>;
