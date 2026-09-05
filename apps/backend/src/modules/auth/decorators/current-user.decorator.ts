import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest, JwtPayload } from '../interfaces';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ) => {
    const request =
      ctx.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
