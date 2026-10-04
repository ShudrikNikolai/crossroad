import { AUTH } from '../consts';
import { createAuthGuard } from './base-auth.guard';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenGuard extends createAuthGuard(AUTH.REFRESH_TOKEN) {}
