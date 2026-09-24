import { z } from 'zod';
import {
  USERNAME_VALIDATION,
  OBJECTID_VALIDATION
} from '../../shared/validation.constants.js';
import { SocialLinksSchema } from './social-link.js';

// Схема публичного профиля (только публичная информация)
export const PublicProfileSchema = z.object({
  id: OBJECTID_VALIDATION,
  username: USERNAME_VALIDATION,
  displayName: z.string().max(255).optional(),
  bio: z.string().max(500).optional(),

  // Аватар
  avatarUrl: z.string().url().optional(),

  // Только публичная информация
  languages: z.array(z.string().length(2)).default([]),
  socialLinks: SocialLinksSchema,
});

export type TPublicProfileSchema = z.infer<typeof PublicProfileSchema>;
