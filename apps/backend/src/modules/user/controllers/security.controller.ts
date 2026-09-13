import { Body, Controller, Patch } from '@nestjs/common';
import { SecurityService } from '../security/security.service';
import { CurrentUser } from '@/modules/auth/decorators';
import { SecurityUpdatePasswordDto } from '../dtos';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Patch('upd-pass')
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() data: SecurityUpdatePasswordDto,
  ) {
    return this.securityService.updatePassword(userId, data);
  }
}
