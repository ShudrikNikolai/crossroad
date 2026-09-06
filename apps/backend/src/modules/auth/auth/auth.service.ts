import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { UserAuthView } from '@/modules/user/ports/user.port';
import { ConfigService } from '@/config';
import { EventService } from '@/infrastructure/event/event.service';
import { Tokens } from '../interfaces';
import { API_AUTH_ERROR } from '@/common';
import { TCreateUserSchema } from '@crossroad/schemas';
import { UserAdapter } from '../adapters/user.adapter';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userAdapter: UserAdapter,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventService: EventService,
  ) {}

  async login(email: string, password: string): Promise<Tokens> {
    const user = await this.userAdapter.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(API_AUTH_ERROR.INVALID_CREDENTIALS);
    }

    const valid = await this.userAdapter.verifyPassword(user.id, password);
    if (!valid) {
      throw new UnauthorizedException(API_AUTH_ERROR.INVALID_CREDENTIALS);
    }

    return this.generateTokens(user);
  }

  async register(data: TCreateUserSchema): Promise<UserAuthView> {
    const user = await this.userAdapter.createUser(data);

    if (!user) {
      throw new ConflictException(API_AUTH_ERROR.USER_ALREADY_EXISTS);
    }

    return user;
  }

  async refresh(userId: string, refreshTokenId: string): Promise<Tokens> {
    const user = await this.userAdapter.findByEmail(
      // TODO
      '',
    );

    if (!user) {
      throw new UnauthorizedException(API_AUTH_ERROR.USER_NOT_FOUND);
    }

    await this.refreshTokenService.revoke(refreshTokenId);

    return this.generateTokens(user);
  }

  async logout(refreshTokenId: string): Promise<void> {
    await this.refreshTokenService.revoke(refreshTokenId);
  }

  private async generateTokens(user: UserAuthView): Promise<Tokens> {
    const refreshJti = randomUUID();

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'access',
      },
      {
        secret: this.configService.auth.jwtSecret,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: refreshJti,
        type: 'refresh',
      },
      {
        secret: this.configService.auth.jwtRefreshSecret,
      },
    );

    const refreshExpiresIn = this.configService.auth.jwtRefreshTtl;

    const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

    await this.refreshTokenService.create(
      user.id,
      refreshJti,
      refreshToken,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
      refreshJti,
      expiresIn: this.configService.auth.jwtAccessTtl,
      refreshExpiresIn,
      tokenType: 'Bearer',
    };
  }
}
