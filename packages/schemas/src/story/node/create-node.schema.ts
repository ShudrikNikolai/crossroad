import { z } from 'zod';

export const NodeTypeSchema = z.enum(['scene', 'choice', 'condition', 'end']);

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const NodeContentSchema = z.object({
  text: z.string().trim().max(5000),
  speaker: z.string().trim().max(100).optional(),
  mediaKey: z.string().optional(), // ключ на объект в MinIO, не сам файл
});

export const CreateNodeSchema = z.object({
  storyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  id: z.string().min(1), // локальный id узла, генерируется на клиенте (React Flow)
  type: NodeTypeSchema,
  position: PositionSchema,
  content: NodeContentSchema,
});

export type TCreateNodeSchema = z.infer<typeof CreateNodeSchema>;
export type TNodeType = z.infer<typeof NodeTypeSchema>;
