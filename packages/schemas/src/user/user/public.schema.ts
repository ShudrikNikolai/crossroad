import { z } from 'zod';

export const UserPublicSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export type UserPublic = z.infer<typeof UserPublicSchema>;
