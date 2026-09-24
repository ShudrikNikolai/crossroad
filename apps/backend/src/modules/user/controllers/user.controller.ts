import { Body, Controller, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import {
  RespOkDto,
  UpdateUserEmailDto,
  UpdateUserPhoneNumberDto,
} from '../dtos';
import { CurrentUser } from '@/common';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('email')
  @ApiOperation({ summary: 'Update account email' })
  @ApiOkResponse({ type: RespOkDto })
  async updateEmail(
    @CurrentUser('id') userId: string,
    @Body() data: UpdateUserEmailDto,
  ) {
    return this.userService.updateEmail(userId, data);
  }

  @Patch('phone')
  @ApiOperation({ summary: 'Update account phone number' })
  @ApiOkResponse({ type: RespOkDto })
  async updatePhoneNumber(
    @CurrentUser('id') userId: string,
    @Body() data: UpdateUserPhoneNumberDto,
  ) {
    return this.userService.updatePhoneNumber(userId, data);
  }
}
