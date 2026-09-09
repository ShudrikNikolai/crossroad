import { PASSWORD_VALIDATION } from '@/shared/validation.constants.js';
import { z } from 'zod';

export const SecurityUpdatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: PASSWORD_VALIDATION
}).refine((data) => data.newPassword === data.oldPassword, {
  message: "Passwords don't match",
  path: ['newPassword'],
});

export type TSecurityUpdatePasswordSchema = z.infer<typeof SecurityUpdatePasswordSchema>
