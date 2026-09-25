import { createZodDto } from 'nestjs-zod';
import {
  CreateNodeSchema,
  NodeResponseSchema,
  PositionSchema,
  UpdateNodeSchema,
} from '@crossroad/schemas';

export class CreateNodeDto extends createZodDto(CreateNodeSchema) {}
export class UpdateNodeDto extends createZodDto(UpdateNodeSchema) {}
export class UpdateNodePositionDto extends createZodDto(PositionSchema) {}
export class NodeResponseDto extends createZodDto(NodeResponseSchema) {}
