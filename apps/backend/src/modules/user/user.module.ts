import {
  ProfileController,
  SecurityController,
  UserController,
} from './controllers';
import { UserModel, UserRepository, UserSchema, UserService } from './core';
import { UserFacade } from './facades/user.facade';
import { USER_PORT } from './ports/user.port';
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
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
    UserFacade,
    UserRepository,
    ProfileService,
    ProfileRepository,
    SecurityService,
    SecurityRepository,
    {
      provide: USER_PORT,
      useExisting: UserFacade,
    },
  ],

  exports: [USER_PORT],
})
export class UserModule {}
