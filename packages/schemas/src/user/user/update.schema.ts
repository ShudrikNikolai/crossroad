import { EMAIL_VALIDATION, PHONE_VALIDATION } from '@/shared/validation.constants.js';
import { z } from 'zod';

export const UpdateUserPhoneNumberSchema = z.object({
  phoneNumber: PHONE_VALIDATION,
});
export type TUpdateUserPhoneNumberSchema = z.infer<typeof UpdateUserPhoneNumberSchema>;

export const UpdateUserEmailSchema = z.object({
  email: EMAIL_VALIDATION,
});
export type TUpdateUserEmailSchema = z.infer<typeof UpdateUserEmailSchema>;
