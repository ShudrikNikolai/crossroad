import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DbService {
  constructor(@InjectConnection() private connection: Connection) {}

  async ping(): Promise<{ status: string; latency: number }> {
    const start = Date.now();

    try {
      if (!this.connection || !this.connection.db) {
        throw new Error();
      }
      await this.connection.db.admin().ping();
      const latency = Date.now() - start;

      return {
        status: 'ok',
        latency,
      };
    } catch (error) {
      return {
        status: 'error',
        latency: Date.now() - start,
      };
    }
  }
}
