import type { TCreateUserSchema } from '@crossroad/schemas';
import { IUserPublic } from '../dtos';

export interface IUserAuthPort {
  findByEmail(email: string): Promise<UserAuthView | null>;
  createUser(data: TCreateUserSchema): Promise<UserAuthView | null>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
  findById(id: string): Promise<UserAuthView | null>;
}

export const USER_FACADE = Symbol('USER_FACADE');

export interface UserAuthView extends IUserPublic {}
