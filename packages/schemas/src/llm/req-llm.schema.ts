import { z } from 'zod';

export const LlmGenerateBranchSchema = z.object({
  storyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  nodeId: z.string().min(1), // узел, от которого генерируем продолжение
  instruction: z.string().trim().max(500).optional(), // доп. указание автора: "сделай мрачнее"
  choicesCount: z.number().int().min(1).max(5).default(3),
});

export type TLlmGenerateBranchSchema = z.infer<typeof LlmGenerateBranchSchema>;

export const LlmGeneratedChoiceSchema = z.object({
  label: z.string().trim().min(1).max(200),
  nodeText: z.string().trim().min(1).max(5000),
});

export const LlmGeneratedBranchSchema = z.object({
  choices: z.array(LlmGeneratedChoiceSchema).min(1).max(5),
});

export type TLlmGeneratedBranch = z.infer<typeof LlmGeneratedBranchSchema>;
