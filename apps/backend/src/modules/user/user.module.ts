import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController, SecurityController, UserController } from './controllers';
import { USER_FACADE } from './facades/user.facade';
import { ProfileModel, ProfileSchema, ProfileRepository, ProfileService } from './profile';
import { SecurityModel, SecuritySchema,SecurityRepository,SecurityService } from './security';
import { UserModel, UserSchema, UserRepository, UserService } from './user';
import { Module } from '@nestjs/common';

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
    // public api
    {
      provide: USER_FACADE,
      useExisting: UserService,
    },
  ],

  exports: [USER_FACADE, UserService, SecurityService],
})
export class UserModule {}
