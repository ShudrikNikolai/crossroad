import {
  CreateUploadUrlSchema,
  MediaResponseSchema,
  UploadUrlResponseSchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateUploadUrlDto extends createZodDto(CreateUploadUrlSchema) {}
export class UploadUrlResponseDto extends createZodDto(
  UploadUrlResponseSchema,
) {}
export class MediaResponseDto extends createZodDto(MediaResponseSchema) {}
