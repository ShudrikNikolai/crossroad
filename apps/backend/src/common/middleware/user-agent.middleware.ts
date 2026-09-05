import {
  Injectable,
  BadRequestException,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { API_ERROR } from '../utils';

@Injectable()
export class UserAgentMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const userAgent = req.get('user-agent');

    if (!userAgent?.trim()) {
      throw new BadRequestException(API_ERROR.BAD_REQUEST);
    }

    next();
  }
}
