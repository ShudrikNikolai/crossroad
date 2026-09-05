export const API_ERROR = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  UNHANDLED_EXCEPTION: 'Unhandled exception',

  BAD_REQUEST: 'Bad request',
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  TOO_MANY_REQUESTS: 'Too many requests',
  SERVICE_UNAVAILABLE: 'Service unavailable',
  BODY_LARGE: 'Request body is too large',
  TIMEOUT: 'HTTP request timeout',
};

export const API_AUTH_ERROR = {
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
  MISSING_TOKEN: 'Authentication token is missing',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
};
