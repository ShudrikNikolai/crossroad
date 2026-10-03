import type { IUserPublic } from '../dtos';
import type { TCreateUserSchema } from '@crossroad/schemas';

export interface UserAuthView extends IUserPublic {}

export interface IUserAuthPort {
  findById(id: string): Promise<UserAuthView | null>;
  findByEmail(email: string): Promise<UserAuthView | null>;
  createUser(data: TCreateUserSchema): Promise<UserAuthView | null>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
}

export const USER_PORT = Symbol('USER_PORT');
