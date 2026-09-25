import {
  CreateGameSchema,
  GameStepResponseSchema,
  UpdateGameNextStepSchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateGameDto extends createZodDto(CreateGameSchema) {}
export class UpdateGameNextStepDto extends createZodDto(
  UpdateGameNextStepSchema,
) {}
export class GameStepResponseDto extends createZodDto(GameStepResponseSchema) {}
