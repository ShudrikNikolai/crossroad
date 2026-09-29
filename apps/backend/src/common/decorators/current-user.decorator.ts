import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../interfaces/request-user.interface';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestUser>();
    const user = request.user;

    return data ? user?.[data as keyof typeof user] : user;
  },
);
