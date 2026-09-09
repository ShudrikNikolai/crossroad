import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './controllers/profile.controller';
import { SecurityController } from './controllers/security.controller';
import { UserController } from './controllers/user.controller';
import { USER_FACADE } from './facades/user.facade';
import { ProfileModel, ProfileSchema } from './profile/profile.model';
import { ProfileRepository } from './profile/profile.repository';
import { ProfileService } from './profile/profile.service';
import { SecurityModel, SecuritySchema } from './security/security.model';
import { SecurityRepository } from './security/security.repository';
import { SecurityService } from './security/security.service';
import { UserModel, UserSchema } from './user/user.model';
import { UserRepository } from './user/user.repository';
import { UserService } from './user/user.service';
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

  exports: [USER_FACADE],
})
export class UserModule {}
