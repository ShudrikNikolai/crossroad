import { z } from 'zod';

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
});

export type TAuthResponse = z.infer<typeof AuthResponseSchema>;
