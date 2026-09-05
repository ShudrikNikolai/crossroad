import { Injectable, Inject } from "@nestjs/common";
import { STORAGE } from "./storage.const";
import { IStorage, StorageUpload } from "./storage.interface";

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE)
    private readonly storage: IStorage,
  ) {}

  upload(data: StorageUpload) {
    return this.storage.upload(data);
  }

  download(key: string) {
    return this.storage.download(key);
  }

  delete(key: string) {
    return this.storage.delete(key);
  }

  exists(key: string) {
    return this.storage.exists(key);
  }

  getUrl(key: string, expiresIn?: number) {
    return this.storage.getUrl(key, expiresIn);
  }
}
