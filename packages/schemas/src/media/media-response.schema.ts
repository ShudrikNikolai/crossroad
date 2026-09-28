import { z } from 'zod';
import { MediaPurposeSchema } from './media-purpose.schema.js';

export const UploadUrlResponseSchema = z
  .object({
    mediaId: z.string(),
    url: z.string(),
    fields: z.record(z.string(), z.string()),
  })
  .meta({ id: 'UploadUrlResponse' });

export const MediaResponseSchema = z
  .object({
    id: z.string(),
    key: z.string(),
    purpose: MediaPurposeSchema,
    status: z.enum(['pending', 'confirmed']),
    contentType: z.string(),
    url: z.string().optional(), // только для confirmed
    createdAt: z.iso.datetime(),
  })
  .meta({ id: 'MediaResponse' });

export type TUploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;
export type TMediaResponse = z.infer<typeof MediaResponseSchema>;
