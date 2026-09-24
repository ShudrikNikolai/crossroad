import {
  UpdateProfileSchema,
  AvatarUploadSchema,
  PublicProfileSchema,
  MeProfileSchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
export class UploadAvatarDto extends createZodDto(AvatarUploadSchema) {}
export class MeDto extends createZodDto(MeProfileSchema) {}
export class PublicProfileDto extends createZodDto(PublicProfileSchema) {}
