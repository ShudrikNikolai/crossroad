import { createZodDto } from 'nestjs-zod';
import { AuthResponseSchema } from '@crossroad/schemas';

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
