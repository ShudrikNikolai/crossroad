import { z } from 'zod';
import {
  USERNAME_VALIDATION,
  URL_VALIDATION,
  OBJECTID_VALIDATION
} from '@/shared/validation.constants.js';

export const PublicSocialLinksSchema = z.object({
  twitter: URL_VALIDATION.optional(),
  github: URL_VALIDATION.optional(),
  linkedin: URL_VALIDATION.optional(),
  telegram: z.string().max(64).optional(),
}).optional();

// Схема публичного профиля (только публичная информация)
export const PublicProfileSchema = z.object({
  id: OBJECTID_VALIDATION,
  username: USERNAME_VALIDATION,
  displayName: z.string().max(255).optional(),
  bio: z.string().max(500).optional(),

  // Аватар
  avatarKey: z.string().optional(),
  avatarUrl: z.string().url().optional(),

  // Только публичная информация
  languages: z.array(z.string().length(2)).default([]),
  socialLinks: PublicSocialLinksSchema,
});

export type TPublicProfileSchema = z.infer<typeof PublicProfileSchema>;
