import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@/config';

@Injectable()
export class MinioClient implements OnModuleInit {
  readonly client: Client;
  readonly bucket: string;
  private readonly logger = new Logger(MinioClient.name);

  constructor(private readonly config: ConfigService) {
    const storage = this.config.storage;
    this.bucket = storage.bucket;
    this.client = new Client({
      endPoint: storage.endpoint,
      port: storage.port,
      useSSL: storage.useSSL,
      accessKey: storage.accessKey,
      secretKey: storage.secretKey,
    });
  }

  async onModuleInit() {
    const exists = await this.client
      .bucketExists(this.bucket)
      .catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      this.logger.log(`Created bucket "${this.bucket}"`);
    }
  }
}
