import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { PinoLogger } from 'nestjs-pino';
import { Connection } from 'mongoose';

@Injectable()
export class DbService {
  constructor(
    @InjectConnection() private connection: Connection,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(DbService.name);
    this.logger.info(
      `Connecting to Mongo`,
      DbService.name,
    );
  }

  async ping(): Promise<{ status: string; latency: number }> {
    const start = Date.now();

    try {
      this.logger.info('Ping mongo service')
      await this.connection.db.admin().ping();
      const latency = Date.now() - start;

      return {
        status: 'ok',
        latency,
      };
    } catch (error) {
      this.logger.error(`Failed to ping Mongo`, error);
      return {
        status: 'error',
        latency: Date.now() - start,
      };
    }
  }
}
