import { AuthResponseSchema } from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
