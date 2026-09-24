import { Body, Controller, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SecurityService } from '../security/security.service';
import { RespOkDto, SecurityUpdatePasswordDto } from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('security')
@ApiBearerAuth('access-token')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Patch('upd-pass')
  @ApiOperation({ summary: 'Update account password' })
  @ApiOkResponse({ type: RespOkDto })
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() data: SecurityUpdatePasswordDto,
  ) {
    return this.securityService.updatePassword(userId, data);
  }
}
