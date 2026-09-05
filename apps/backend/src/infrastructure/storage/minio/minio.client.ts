import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@/config/config.service';

@Injectable()
export class MinioClient {
  readonly client: Client;

  constructor(private readonly config: ConfigService) {
    const storage = this.config.storage;

    this.client = new Client({
      endPoint: storage.endpoint,
      port: storage.port,
      useSSL: storage.useSSL,
      accessKey: storage.accessKey,
      secretKey: storage.secretKey,
    });
  }
}
