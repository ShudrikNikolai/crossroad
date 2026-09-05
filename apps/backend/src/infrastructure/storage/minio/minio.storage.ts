import { Injectable } from '@nestjs/common';
import { MinioClient } from './minio.client';
import {
  IStorage,
  StorageObject,
  StorageUpload,
} from '../storage.interface';

@Injectable()
export class MinioStorage implements IStorage {
  constructor(private readonly minio: MinioClient) {}

  async upload(data: StorageUpload): Promise<StorageObject> {
    // implementation
  }

  async download(key: string): Promise<Buffer> {
    // implementation
  }

  async delete(key: string): Promise<void> {
    // implementation
  }

  async exists(key: string): Promise<boolean> {
    // implementation
  }

  async getUrl(key: string, expiresIn = 3600): Promise<string> {
    // implementation
  }
}
