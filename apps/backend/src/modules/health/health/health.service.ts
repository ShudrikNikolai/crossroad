import { DbService } from '@/infrastructure/database/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  constructor(private readonly dbService: DbService) {}

  async checkDb(): Promise<{ status: string }> {
    const db = await this.dbService.ping();
    return { status: db.status };
  }
}
