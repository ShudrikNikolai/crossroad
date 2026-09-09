import { z } from 'zod';
import {
  USERNAME_VALIDATION,
  URL_VALIDATION,
} from '@/shared/validation.constants.js';

// Схема для обновления социальных ссылок
export const UpdateSocialLinksSchema = z.object({
  twitter: URL_VALIDATION.optional().nullable(),
  github: URL_VALIDATION.optional().nullable(),
  linkedin: URL_VALIDATION.optional().nullable(),
  telegram: z.string().max(64).optional().nullable(),
}).optional();

// Схема для обновления профиля (все поля опциональны)
export const UpdateProfileSchema = z.object({
  _id: z.string(),
  username: USERNAME_VALIDATION.optional(),
  displayName: z
    .string()
    .max(255, 'Display name must not exceed 255 characters')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional()
    .nullable(),

  // Аватар
  avatarKey: z
    .string()
    .optional()
    .nullable(),

  // Настройки
  isPublic: z.boolean().optional(),
  languages: z
    .array(z.string().length(2, 'Language code must be 2 characters'))
    .optional(),

  // Социальные ссылки
  socialLinks: UpdateSocialLinksSchema,
}).strict(); // Запрещаем неожиданные поля

export type TUpdateProfileSchema = z.infer<typeof UpdateProfileSchema>;

// Схема для валидации загрузки аватара
export const AvatarUploadSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().regex(/^image\/(jpeg|png|gif|webp)$/, 'Only image files are allowed'),
    size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB'),
  }),
}).strict();

export type TAvatarUploadSchema = z.infer<typeof AvatarUploadSchema>;
