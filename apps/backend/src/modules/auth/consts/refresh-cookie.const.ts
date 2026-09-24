import type { CookieOptions } from 'express';
import { AUTH } from './env.const';

export const REFRESH_COOKIE_NAME = AUTH.REFRESH_TOKEN;

export const getRefreshCookieOptions = (isProd: boolean): CookieOptions => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
