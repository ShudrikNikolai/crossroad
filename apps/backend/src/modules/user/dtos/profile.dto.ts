import { UpdateProfileSchema, AvatarUploadSchema } from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
export class UploadAvatarDto extends createZodDto(AvatarUploadSchema) {}
