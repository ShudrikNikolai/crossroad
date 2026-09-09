import { EMAIL_VALIDATION, PASSWORD_VALIDATION, USERNAME_VALIDATION } from '@/shared/validation.constants.js';
import { z } from 'zod';

export const StrictRegisterSchema = z
  .object({
    email: EMAIL_VALIDATION,
    password: PASSWORD_VALIDATION,
    confirmPassword: z.string().min(8),
    username: USERNAME_VALIDATION,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TStrictRegisterSchema = z.infer<typeof StrictRegisterSchema>;
