import type { Request } from 'express';
import type { UserAuthView } from '@/modules/user/facades/user.facade';
// TODO избавиться тут от UserAuthView
export interface AuthRequest extends Request {
  user: UserAuthView;
}
