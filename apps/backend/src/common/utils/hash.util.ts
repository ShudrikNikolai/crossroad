import * as bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUNDS } from './const.util';

export const bcryptHash = async (token: string) => {
  return bcrypt.hash(token, PASSWORD_SALT_ROUNDS);
};

export const bcryptCompare = async (token: string, tokenHash: string) =>
  bcrypt.compare(token, tokenHash);
