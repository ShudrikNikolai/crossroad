import {
  CreateStorySchema,
  FullGraphResponseSchema,
  StoryResponseSchema,
  UpdateStorySchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateStoryDto extends createZodDto(CreateStorySchema) {}
export class UpdateStoryDto extends createZodDto(UpdateStorySchema) {}
export class StoryResponseDto extends createZodDto(StoryResponseSchema) {}
export class FullGraphResponseDto extends createZodDto(
  FullGraphResponseSchema,
) {}
