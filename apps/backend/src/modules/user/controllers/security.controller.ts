import { Controller, Patch } from '@nestjs/common';
import { SecurityService } from '../security/security.service';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Patch()
  async updatePassword() {
    return this.securityService.updatePass();
  }
}
