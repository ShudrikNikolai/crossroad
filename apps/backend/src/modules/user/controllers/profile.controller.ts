import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { CurrentUser } from '@/modules/auth/decorators';
import { UpdateProfileDto, UploadAvatarDto } from '../dtos';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async me(@CurrentUser('id') userId: string) {
    return this.profileService.getMe(userId);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: UpdateProfileDto,
  ) {
    return this.profileService.updateMe(userId, data);
  }

  @Post('me/avatar')
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @Body() data: UploadAvatarDto,
  ) {
    return this.profileService.uploadAvatar(userId, data);
  }

  @Get(':id')
  async getProfile(@Param('id') profleId: string) {
    return this.profileService.getPublicProfile(profleId);
  }
}
