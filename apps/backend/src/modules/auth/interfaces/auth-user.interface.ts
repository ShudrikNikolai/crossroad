import type { Request } from 'express';
import type { UserAuthView } from '@/modules/user/ports/user.port';

export interface AuthRequest extends Request {
  user: UserAuthView;
}
