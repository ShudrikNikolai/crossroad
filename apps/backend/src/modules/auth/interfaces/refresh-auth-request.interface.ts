import type { Request } from 'express';
import type { RefreshTokenDocument } from '../refresh-token/refresh-token.model';

export interface RefreshAuthRequest extends Request {
  user: {
    userId: string;
    refreshTokenId: string;
    refreshToken: RefreshTokenDocument;
  };
}
