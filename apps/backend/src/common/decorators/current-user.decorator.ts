import { UserAuthView } from '@/modules/user/facades/user.facade';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthRequest extends Request {
  user: UserAuthView; // TODO
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthRequest['user'] | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    return data ? user?.[data] : user;
  },
);
