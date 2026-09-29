import { MongooseModule } from '@nestjs/mongoose';
import {
  ProfileController,
  SecurityController,
  UserController,
} from './controllers';
import {
  ProfileModel,
  ProfileRepository,
  ProfileSchema,
  ProfileService,
} from './profile';
import {
  SecurityModel,
  SecurityRepository,
  SecuritySchema,
  SecurityService,
} from './security';
import { UserModel, UserRepository, UserSchema, UserService } from './core';
import { Module } from '@nestjs/common';
import { USER_PORT } from './ports/user.port';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
      {
        name: ProfileModel.name,
        schema: ProfileSchema,
      },
      {
        name: SecurityModel.name,
        schema: SecuritySchema,
      },
    ]),
  ],
  controllers: [UserController, ProfileController, SecurityController],
  providers: [
    UserService,
    UserRepository,
    ProfileService,
    ProfileRepository,
    SecurityService,
    SecurityRepository,
    {
      provide: USER_PORT,
      useExisting: UserService,
    },
  ],

  exports: [USER_PORT],
})
export class UserModule {}
