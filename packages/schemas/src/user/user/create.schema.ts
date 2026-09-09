import { EMAIL_VALIDATION, PASSWORD_VALIDATION, USERNAME_VALIDATION } from '@/shared/validation.constants.js';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: EMAIL_VALIDATION,
  username: USERNAME_VALIDATION,
  password: PASSWORD_VALIDATION,
  authMethod: z.enum(['oauth', 'email']).default('email'),
});

export type TCreateUserSchema = z.infer<typeof CreateUserSchema>;
