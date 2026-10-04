import type { UserAuthView } from '@/modules/user/ports/user.port';
import type { Request } from 'express';

export interface AuthRequest extends Request {
  user: UserAuthView;
}
