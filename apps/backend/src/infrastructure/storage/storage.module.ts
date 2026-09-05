import { Global, Module } from '@nestjs/common';
import { MinioClient } from './minio/minio.client';
import { MinioStorage } from './minio/minio.storage';
import { STORAGE } from './storage.const';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [
    MinioClient,
    {
      provide: STORAGE,
      useClass: MinioStorage,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
