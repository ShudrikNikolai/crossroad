import { Global } from "@nestjs/common";
import Module from "module";
import { MinioClient } from "./minio/minio.client";
import { MinioStorage } from "./minio/minio.storage";
import { STORAGE } from "./storage.const";
import { StorageService } from "./storage.service";


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
