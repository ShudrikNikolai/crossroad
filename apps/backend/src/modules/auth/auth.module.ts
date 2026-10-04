import { UserModule } from '../user/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './core/auth.service';
import { JwtAuthGuard, RefreshTokenGuard } from './guards';
import {
  RefreshTokenModel,
  RefreshTokenRepository,
  RefreshTokenSchema,
  RefreshTokenService,
} from './refresh-token';
import { JwtRefreshStrategy, JwtStrategy } from './strategies';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UserModule,
    PassportModule.register({}),
    JwtModule.register({}),
    MongooseModule.forFeature([
      {
        name: RefreshTokenModel.name,
        schema: RefreshTokenSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenRepository,
    RefreshTokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,
  ],
})
export class AuthModule {}
