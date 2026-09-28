export interface StorageUpload {
  key: string;
  buffer: Buffer;
  contentType?: string;
}

export interface StorageObject {
  key: string;
  size: number;
  contentType?: string;
}

export interface UploadPolicyRequest {
  key: string;
  contentType: string;
  maxSizeBytes: number;
  expiresIn?: number;
}

export interface UploadPolicy {
  url: string;
  fields: Record<string, string>;
}

export interface IStorage {
  upload(data: StorageUpload): Promise<StorageObject>;
  getUploadPolicy(data: UploadPolicyRequest): Promise<UploadPolicy>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string, expiresIn?: number): Promise<string>;
}
