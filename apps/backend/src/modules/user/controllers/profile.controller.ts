import { Controller, Get, Param } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Param('id') profleId: string) {
    return this.profileService.findById(profleId);
  }
}
