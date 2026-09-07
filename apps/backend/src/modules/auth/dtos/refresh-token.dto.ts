import {
  RefreshTokenSchema,
  type TRefreshTokenSchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
export interface IRefreshToken extends TRefreshTokenSchema {}
