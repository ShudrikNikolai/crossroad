import { TAuthResponse, TLoginSchema, TStrictRegisterSchema } from "@crossroad/schemas";

export type LoginRequest = TLoginSchema
export type RegisterRequest = TStrictRegisterSchema
export type AuthResponse = TAuthResponse
// TODO оставшиеся интерфейсы привести к норм формату
export interface AuthUser  {
  id: string;
  email?: string;
  username: string;
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
