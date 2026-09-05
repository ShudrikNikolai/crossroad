export interface Tokens {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;

  expiresIn: number;
  refreshExpiresIn: number;

  tokenType: 'Bearer';
}
