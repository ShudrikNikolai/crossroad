import { z } from 'zod';
import {
  USERNAME_VALIDATION,
  OBJECTID_VALIDATION
} from '../../shared/validation.constants.js';
import { SocialLinksSchema } from './social-link.js';

export const MeProfileSchema = z.object({
  id: OBJECTID_VALIDATION,
  username: USERNAME_VALIDATION,
  displayName: z.string().max(255, 'Display name must not exceed 255 characters').optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),

  // Аватар
  avatarUrl: z.string().url().optional(),

  // Настройки профиля
  isPublic: z.boolean().default(true),
  languages: z.array(z.string().length(2, 'Language code must be 2 characters')).default(['ru']),

  // Социальные ссылки
  socialLinks: SocialLinksSchema,
  // meta
  updatedAt: z.iso.datetime(),
});

export type TMeProfileSchema = z.infer<typeof MeProfileSchema>;
