import { Type, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';

import { API_AUTH } from '../consts';

export function createAuthGuard(strategy: string | string[]): Type<IAuthGuard> {
  class MixinAuthGuard extends AuthGuard(strategy) {
    handleRequest<TUser>(err: unknown, user: TUser, info: unknown): TUser {
      if (err || !user) {
        if (
          info &&
          typeof info === 'object' &&
          'name' in info &&
          info.name === 'TokenExpiredError'
        ) {
          throw new UnauthorizedException(API_AUTH.TOKEN_EXPIRED);
        }

        throw err instanceof Error
          ? err
          : new UnauthorizedException(API_AUTH.INVALID_TOKEN);
      }

      return user;
    }
  }

  return MixinAuthGuard;
}
