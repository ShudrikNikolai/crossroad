import { LoginSchema, type TLoginSchema } from '@crossroad/schemas';
import { createZodDto } from 'nestjs-zod';

export class LoginDto extends createZodDto(LoginSchema) {}
export interface ILogin extends TLoginSchema {}
