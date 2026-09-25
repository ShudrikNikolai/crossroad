import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { UserAuthAdapter } from './adapters/user.adapter';
import { JwtAuthGuard, RefreshTokenGuard } from './guards';
import { JwtStrategy, JwtRefreshStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import {
  RefreshTokenModel,
  RefreshTokenSchema,
  RefreshTokenService,
  RefreshTokenRepository,
} from './refresh-token';
import { AuthService } from './auth/auth.service';

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
    UserAuthAdapter,
    RefreshTokenRepository,
    RefreshTokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,
  ],
})
export class AuthModule {}
