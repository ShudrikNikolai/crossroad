import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CurrentUser, Public } from '../decorators';
import { RefreshTokenGuard } from '../guards';
import { RegisterUserDto, LoginDto, RefreshTokenDto } from '../dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() data: RegisterUserDto) {
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data.email, data.password);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser('id') userId: string,
    @Body() data: RefreshTokenDto,
  ) {
    return this.authService.refresh(userId, data.refreshToken);
  }

  @Post('logout')
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.authService.logout(userId);
  }
}
