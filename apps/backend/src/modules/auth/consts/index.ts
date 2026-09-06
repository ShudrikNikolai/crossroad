export const AUTH = {
  JWT: 'jwt',
  REFRESH_TOKEN: 'refresh-token',
  REFRESH_BODY_TOKEN: 'refreshToken',
  IS_PUBLIC_KEY: 'isPublic',
  ROLES_KEY: 'roles',
} as const;

export const TOKEN = {
  BLACKLIST_PREFIX: 'black:',
  QUERY_PARAM: 'token',
  BODY_PARAM: 'refreshToken',
} as const;

export const API_AUTH = {
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid or expired token',
} as const;

export const DEFAULT_REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

export const MAX_AGE = (seconds: number): number => seconds * 1000;
