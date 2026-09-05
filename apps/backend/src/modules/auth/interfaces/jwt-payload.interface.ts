export interface JwtPayload {
  sub: string | number;
  id?: string;
  jti?: string;
  iat?: number;
  exp?: number;
  type: 'access' | 'refresh' | 'reset' | 'verify';
}
