import { createZodDto } from 'nestjs-zod';
import {
  CreateStorySchema,
  UpdateStorySchema,
  FullGraphResponseSchema,
  StoryResponseSchema,
} from '@crossroad/schemas';

export class CreateStoryDto extends createZodDto(CreateStorySchema) {}
export class UpdateStoryDto extends createZodDto(UpdateStorySchema) {}
export class StoryResponseDto extends createZodDto(StoryResponseSchema) {}
export class FullGraphResponseDto extends createZodDto(
  FullGraphResponseSchema,
) {}
