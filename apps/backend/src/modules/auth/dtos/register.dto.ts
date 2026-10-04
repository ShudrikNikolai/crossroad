import {
  StrictRegisterSchema,
  type TStrictRegisterSchema,
} from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class RegisterUserDto extends createZodDto(StrictRegisterSchema) {}
export interface IRegisterUser extends TStrictRegisterSchema {}
