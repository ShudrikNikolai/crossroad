import { ConfigService } from '@/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';
import { UserAdapter } from '../adapters/user.adapter';
import { AUTH } from '../consts';
import { API_AUTH_ERROR } from '@/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTH.JWT) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userAdapter: UserAdapter,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req.cookies?.access_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.auth.jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userAdapter.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(API_AUTH_ERROR.USER_NOT_FOUND);
    }

    return user;
  }
}
