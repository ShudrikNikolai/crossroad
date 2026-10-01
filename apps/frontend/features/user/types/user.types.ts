import {
  TMeProfileSchema,
  TSecurityUpdatePasswordSchema,
  TSocialLinks,
  TUpdateProfileSchema,
  TUpdateUserEmailSchema,
  TUpdateUserPhoneNumberSchema,
} from '@crossroad/schemas';

export type SocialLinks = TSocialLinks;
export type UserProfile = TMeProfileSchema;

export type UpdateProfileRequest = TUpdateProfileSchema;

export type UpdatePasswordRequest = TSecurityUpdatePasswordSchema;
export type UpdateEmailRequest = TUpdateUserEmailSchema;
export type UpdatePhoneRequest = TUpdateUserPhoneNumberSchema;
