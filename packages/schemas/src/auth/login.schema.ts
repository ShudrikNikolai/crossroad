import { EMAIL_VALIDATION, PASSWORD_VALIDATION } from '@/shared/validation.constants.js';
import { z } from 'zod';

export const LoginSchema = z
  .object({
    email: EMAIL_VALIDATION,
    password: PASSWORD_VALIDATION,
  });

export type TLoginSchema = z.infer<typeof LoginSchema>;
