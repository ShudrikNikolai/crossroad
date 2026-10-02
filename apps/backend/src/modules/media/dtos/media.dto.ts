import { createZodDto } from 'nestjs-zod';
import {
  CreateUploadUrlSchema,
  MediaResponseSchema,
  UploadUrlResponseSchema,
} from '@crossroad/schemas';

export class CreateUploadUrlDto extends createZodDto(CreateUploadUrlSchema) {}
export class UploadUrlResponseDto extends createZodDto(
  UploadUrlResponseSchema,
) {}
export class MediaResponseDto extends createZodDto(MediaResponseSchema) {}
