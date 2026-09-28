import { z } from 'zod';
import { MediaPurposeSchema } from './media-purpose.schema.js';

export const CreateUploadUrlSchema = z
  .object({
    purpose: MediaPurposeSchema,
    contentType: z.string().min(1),
    size: z.number().int().positive(),
    storyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
  })
  .refine((d) => d.purpose !== 'story-media' || !!d.storyId, {
    message: 'storyId is required for story-media',
    path: ['storyId'],
  });

export type TCreateUploadUrlSchema = z.infer<typeof CreateUploadUrlSchema>;
