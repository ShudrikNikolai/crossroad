import { z } from 'zod';

export const MediaPurposeSchema = z.enum(['avatar', 'story-media']);
export type TMediaPurpose = z.infer<typeof MediaPurposeSchema>;
