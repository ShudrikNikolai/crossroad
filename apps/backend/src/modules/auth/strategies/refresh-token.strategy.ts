import { ConfigService } from '@/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayload } from '../interfaces';
import { AUTH } from '../consts';
import { API_AUTH_ERROR } from '@/common';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  AUTH.REFRESH_TOKEN,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromBodyField(AUTH.REFRESH_BODY_TOKEN),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.cookies?.refresh_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.auth.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshTokenPayload) {
    const token =
      ExtractJwt.fromBodyField(AUTH.REFRESH_BODY_TOKEN)(req) ??
      ExtractJwt.fromAuthHeaderAsBearerToken()(req) ??
      req?.cookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException(API_AUTH_ERROR.INVALID_OR_EXPIRED_TOKEN);
    }

    const refreshToken = await this.refreshTokenService.findByJti(payload.jti);
    if (!refreshToken) {
      throw new UnauthorizedException(API_AUTH_ERROR.INVALID_OR_EXPIRED_TOKEN);
    }

    const valid = await this.refreshTokenService.verify(token, refreshToken);
    if (!valid) {
      throw new UnauthorizedException(API_AUTH_ERROR.INVALID_OR_EXPIRED_TOKEN);
    }

    return {
      userId: payload.sub,
      refreshTokenId: payload.jti,
      refreshToken,
    };
  }
}
