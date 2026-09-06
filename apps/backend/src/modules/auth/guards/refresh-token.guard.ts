import { Injectable } from '@nestjs/common';
import { createAuthGuard } from './base-auth.guard';
import { AUTH } from '../consts';

@Injectable()
export class RefreshTokenGuard extends createAuthGuard(AUTH.REFRESH_TOKEN) {}
