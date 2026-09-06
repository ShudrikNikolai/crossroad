import { z } from 'zod';

export const UserPublicSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
});

export type UserPublic = z.infer<typeof UserPublicSchema>;
