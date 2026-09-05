import type { TCreateUserSchema } from '@crossroad/schemas';

export interface IUserPort {
  findByEmail(email: string): Promise<UserAuthView | null>;
  createUser(data: TCreateUserSchema): Promise<UserAuthView | null>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
}

export const USER_PORT = Symbol('USER_PORT');

export interface UserAuthView {
  id: string;
  email: string;
}
