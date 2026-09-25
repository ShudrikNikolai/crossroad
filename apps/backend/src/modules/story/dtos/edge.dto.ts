import {
  CreateEdgeSchema,
  EdgeResponseSchema,
  UpdateEdgeSchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class CreateEdgeDto extends createZodDto(CreateEdgeSchema) {}
export class UpdateEdgeDto extends createZodDto(UpdateEdgeSchema) {}
export class EdgeResponseDto extends createZodDto(EdgeResponseSchema) {}
