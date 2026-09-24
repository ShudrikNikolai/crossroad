import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from '../profile/profile.service';
import {
  UpdateProfileDto,
  UploadAvatarDto,
  PublicProfileDto,
  MeDto,
} from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('profile')
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: MeDto })
  async me(@CurrentUser('id') userId: string) {
    return this.profileService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: MeDto })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: UpdateProfileDto,
  ) {
    return this.profileService.updateMe(userId, data);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload profile avatar' })
  @ApiOkResponse({ type: MeDto })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @Body() data: UploadAvatarDto,
  ) {
    return this.profileService.uploadAvatar(userId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile by user id' })
  @ApiOkResponse({ type: PublicProfileDto })
  async getProfile(@Param('id') profileId: string) {
    return this.profileService.getPublicProfile(profileId);
  }
}
