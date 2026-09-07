export const API_RESPONSE_TIMEOUT = 10_000 as const;
export const API_AUTH = {
  KEY: 'name',
  KEY_EXPIRE: 'TokenExpiredError',
  ERR: {
    TOKEN_EXPIRED: 'Token expired',
    INVALID: 'Invalid or expired token',
  },
};
export const PASSWORD_SALT_ROUNDS = 12 as const;
