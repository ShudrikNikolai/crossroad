import { MinioClient } from './minio/minio.client';
import { MinioStorage } from './minio/minio.storage';
import { STORAGE } from './storage.const';
import { StorageService } from './storage.service';
import { Global, Module } from '@nestjs/common';

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
