import {
  CreateVariableSchema,
  UpdateVariableSchema,
  VariableResponseSchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateVariableDto extends createZodDto(CreateVariableSchema) {}
export class UpdateVariableDto extends createZodDto(UpdateVariableSchema) {}
export class VariableResponseDto extends createZodDto(VariableResponseSchema) {}
