import { z } from 'zod';

export interface IUserSanitize {
  id: string;
  username: string;
  country: string | null;
  city: string | null;
  birthDate: Date;
}
// TODO zod
export const UserPublicSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
});

export type UserPublic = z.infer<typeof UserPublicSchema>;
