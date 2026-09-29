import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { UserAuthAdapter } from './adapters/user.adapter';
import { JwtAuthGuard, RefreshTokenGuard } from './guards';
import { JwtRefreshStrategy, JwtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import {
  RefreshTokenModel,
  RefreshTokenRepository,
  RefreshTokenSchema,
  RefreshTokenService,
} from './refresh-token';
import { AuthService } from './services/auth.service';

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
