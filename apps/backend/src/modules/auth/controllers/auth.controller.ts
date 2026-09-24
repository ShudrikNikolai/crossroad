import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { RefreshTokenGuard } from '../guards';
import {
  RegisterUserDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
} from '../dtos';
import { CurrentUser, Public } from '@/common';
import { ConfigService } from '@/config';
import { REFRESH_COOKIE_NAME, getRefreshCookieOptions } from '../consts';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiOkResponse({ type: AuthResponseDto })
  async register(
    @Body() data: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(data);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(data.email, data.password);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange a refresh token for a new access token' })
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(
    @CurrentUser('id') userId: string,
    @Body() data: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // data.refreshToken остаётся для клиентов без cookie (мобильные/сторонние API-консьюмеры);
    // веб-клиент получит тот же токен из req.cookies через стратегию, тело может быть пустым
    const result = await this.authService.refresh(userId, data.refreshToken);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out and invalidate the current session' })
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(userId);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      getRefreshCookieOptions(this.configService.isProd),
    );
  }
}
