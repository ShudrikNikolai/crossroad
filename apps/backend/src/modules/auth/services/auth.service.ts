import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { UserAuthView } from '@/modules/user/facades/user.facade';
import { ConfigService } from '@/config';
import { EventService } from '@/infrastructure/event/event.service';
import { Tokens } from '../interfaces';
import { API_AUTH_ERROR } from '@/common';
import { UserAuthAdapter } from '../adapters/user.adapter';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { IRegisterUser } from '../dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly userAdapter: UserAuthAdapter,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventService: EventService,
  ) {}
  async login(email: string, password: string): Promise<Tokens> {
    const user = await this.userAdapter.findByEmail(email);
    // TODO объеденить в одну функцию, хуйня два запроса слать.
    if (!user) {
      throw new UnauthorizedException(API_AUTH_ERROR.INVALID_CREDENTIALS);
    }

    const valid = await this.userAdapter.verifyPassword(user.id, password);
    if (!valid) {
      throw new UnauthorizedException(API_AUTH_ERROR.INVALID_CREDENTIALS);
    }

    return this.generateTokens(user);
  }

  async register(rawData: IRegisterUser): Promise<Tokens> {
    const data = {
      email: rawData.email,
      username: rawData.username,
      password: rawData.password,
      authMethod: 'email' as const,
    };
    const user: UserAuthView | null = await this.userAdapter.createUser(data);

    if (!user) {
      throw new ConflictException(API_AUTH_ERROR.USER_ALREADY_EXISTS);
    }

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async refresh(userId: string, refreshTokenId: string): Promise<Tokens> {
    const user = await this.userAdapter.findById(userId);

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
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'access',
        },
        {
          secret: this.configService.auth.jwtSecret,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          jti: refreshJti,
          type: 'refresh',
        },
        {
          secret: this.configService.auth.jwtRefreshSecret,
        },
      ),
    ]);

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
