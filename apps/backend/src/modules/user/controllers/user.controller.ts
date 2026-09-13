import { Body, Controller, Patch } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UpdateUserEmailDto, UpdateUserPhoneNumberDto } from '../dtos';
import { CurrentUser } from '@/modules/auth/decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('email')
  async updateEmail(
    @CurrentUser('id') id: string,
    @Body() data: UpdateUserEmailDto,
  ) {
    return this.userService.updateEmail(id, data);
  }

  @Patch('phone')
  async updatePhoneNumber(
    @CurrentUser('id') id: string,
    @Body() data: UpdateUserPhoneNumberDto,
  ) {
    return this.userService.updatePhoneNumber(id, data);
  }
}
