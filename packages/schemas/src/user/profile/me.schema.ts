import { z } from 'zod';
import {
  USERNAME_VALIDATION,
  URL_VALIDATION,
  OBJECTID_VALIDATION
} from '@/shared/validation.constants.js';

// Схема для соц ссылок
export const SocialLinksSchema = z.object({
  twitter: URL_VALIDATION.optional(),
  github: URL_VALIDATION.optional(),
  linkedin: URL_VALIDATION.optional(),
  telegram: z.string().max(64).optional(),
}).optional();

export const MeProfileSchema = z.object({
  id: OBJECTID_VALIDATION,
  username: USERNAME_VALIDATION,
  displayName: z.string().max(255, 'Display name must not exceed 255 characters').optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),

  // Аватар
  avatarKey: z.string().optional(),
  avatarUrl: z.string().url().optional(),

  // Настройки профиля
  isPublic: z.boolean().default(false),
  languages: z.array(z.string().length(2, 'Language code must be 2 characters')).default(['ru']),

  // Социальные ссылки
  socialLinks: SocialLinksSchema,

  // meta
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TMeProfileSchema = z.infer<typeof MeProfileSchema>;
