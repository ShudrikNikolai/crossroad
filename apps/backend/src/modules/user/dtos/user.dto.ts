import {
  UpdateUserEmailSchema,
  UpdateUserPhoneNumberSchema,
  UserPublic,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserPhoneNumberDto extends createZodDto(
  UpdateUserPhoneNumberSchema,
) {}
export class UpdateUserEmailDto extends createZodDto(UpdateUserEmailSchema) {}

export interface IUserPublic extends UserPublic {}
