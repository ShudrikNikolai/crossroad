import { AUTH } from '../consts';
import { createAuthGuard } from './base-auth.guard';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends createAuthGuard(AUTH.JWT) {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      AUTH.IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
