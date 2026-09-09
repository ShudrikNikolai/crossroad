import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { CurrentUser } from '@/modules/auth/decorators';
import { UpdateProfileDto } from '../dtos';
import { TUpdateProfileSchema } from '@crossroad/schemas';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async me(@CurrentUser('id') _id: string) {
    return this.profileService.getMe(_id);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') profleId: string,
    @Body() data: UpdateProfileDto,
  ): Promise<TUpdateProfileSchema> {
    return this.profileService.updateMe(profleId, data);
  }

  @Get(':id')
  async getProfile(@Param('id') profleId: string) {
    return this.profileService.getProfile(profleId);
  }

  @Post('avatar')
  async uploadAvatar() {
    return this.profileService.uploadAvatar();
  }
}
