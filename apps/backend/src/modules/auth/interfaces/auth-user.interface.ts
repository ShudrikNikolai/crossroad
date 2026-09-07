import type { Request } from 'express';
import type { UserAuthView } from '@/modules/user/ports/user.port';
// TODO избавиться тут от UserAuthView
export interface AuthRequest extends Request {
  user: UserAuthView;
}
