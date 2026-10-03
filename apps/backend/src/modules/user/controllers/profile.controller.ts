import { MeDto, PublicProfileDto, UpdateProfileDto } from '../dtos';
import { ProfileService } from '../profile/profile.service';
import { CurrentUser } from '@/common';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

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

  @Get(':id')
  @ApiOperation({ summary: 'Get public profile by user id' })
  @ApiOkResponse({ type: PublicProfileDto })
  async getProfile(@Param('id') profileId: string) {
    return this.profileService.getPublicProfile(profileId);
  }
}
