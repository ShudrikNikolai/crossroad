import { AUTH } from '../consts';
import { JwtPayload } from '../interfaces';
import { API_AUTH_ERROR } from '@/common';
import { ConfigService } from '@/config';
import { USER_PORT, type IUserAuthPort } from '@/modules/user/ports/user.port';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTH.JWT) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_PORT) private readonly userService: IUserAuthPort,
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
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(API_AUTH_ERROR.USER_NOT_FOUND);
    }

    return user;
  }
}
