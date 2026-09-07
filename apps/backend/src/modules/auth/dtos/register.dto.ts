import { createZodDto } from 'nestjs-zod';
import {
  StrictRegisterSchema,
  type TStrictRegisterSchema,
} from '@crossroad/schemas';

export class RegisterUserDto extends createZodDto(StrictRegisterSchema) {}
export interface IRegisterUser extends TStrictRegisterSchema {}
