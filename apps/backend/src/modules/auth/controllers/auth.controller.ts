import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { Public } from '../decorators';
import { JwtAuthGuard, RefreshTokenGuard } from '../guards';
import type { AuthRequest, RefreshAuthRequest } from '../interfaces';
import type { TCreateUserSchema, TLoginSchema } from '@crossroad/schemas';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() data: TCreateUserSchema) {
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  async login(@Body() data: TLoginSchema) {
    return this.authService.login(data.email, data.password);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() request: RefreshAuthRequest) {
    return this.authService.refresh(
      request.user.userId,
      request.user.refreshTokenId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() request: RefreshAuthRequest): Promise<void> {
    await this.authService.logout(request.user.refreshTokenId);
  }
}
