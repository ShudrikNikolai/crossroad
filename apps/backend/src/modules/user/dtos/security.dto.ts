import { SecurityUpdatePasswordSchema } from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class SecurityUpdatePasswordDto extends createZodDto(
  SecurityUpdatePasswordSchema,
) {}
