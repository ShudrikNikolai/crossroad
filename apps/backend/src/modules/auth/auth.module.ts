import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { UserAdapter } from './adapters/user.adapter';
import { JwtAuthGuard, RefreshTokenGuard } from './guards';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/refresh-token.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import {
  RefreshTokenModel,
  RefreshTokenSchema,
} from './refresh-token/refresh-token.model';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { AuthService } from './auth/auth.service';
import { RefreshTokenRepository } from './refresh-token/refresh-token.repository';

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
    UserAdapter,
    RefreshTokenRepository,
    RefreshTokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,
  ],
})
export class AuthModule {}
