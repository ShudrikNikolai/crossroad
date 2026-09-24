export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
  expiresIn: number;
  refreshExpiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}
// TODO
