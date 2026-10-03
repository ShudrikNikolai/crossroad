import {
  IStorage,
  StorageObject,
  StorageUpload,
  UploadPolicy,
  UploadPolicyRequest,
} from '../storage.interface';
import { MinioClient } from './minio.client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MinioStorage implements IStorage {
  constructor(private readonly minio: MinioClient) {}

  async upload(data: StorageUpload): Promise<StorageObject> {
    const { key, buffer, contentType } = data;

    await this.minio.client.putObject(
      this.minio.bucket,
      key,
      buffer,
      buffer.length,
      contentType ? { 'Content-Type': contentType } : undefined,
    );

    return {
      key,
      size: buffer.length,
      contentType,
    };
  }

  async download(key: string): Promise<Buffer> {
    const stream = await this.minio.client.getObject(this.minio.bucket, key);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async delete(key: string): Promise<void> {
    await this.minio.client.removeObject(this.minio.bucket, key);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.minio.client.statObject(this.minio.bucket, key);
      return true;
    } catch (err: any) {
      if (err?.code === 'NotFound' || err?.code === 'NoSuchKey') {
        return false;
      }
      throw err;
    }
  }

  async getUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.minio.client.presignedGetObject(
      this.minio.bucket,
      key,
      expiresIn,
    );
  }

  async getUploadPolicy(data: UploadPolicyRequest): Promise<UploadPolicy> {
    const { key, contentType, maxSizeBytes, expiresIn = 600 } = data;

    const policy = this.minio.client.newPostPolicy();
    policy.setBucket(this.minio.bucket);
    policy.setKey(key);
    policy.setContentType(contentType);
    policy.setContentLengthRange(1, maxSizeBytes);
    policy.setExpires(new Date(Date.now() + expiresIn * 1000));

    const { postURL, formData } =
      await this.minio.client.presignedPostPolicy(policy);
    return { url: postURL, fields: formData };
  }
}
