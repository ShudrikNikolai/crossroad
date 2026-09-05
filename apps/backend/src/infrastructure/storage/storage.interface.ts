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

export interface IStorage {
  upload(data: StorageUpload): Promise<StorageObject>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getUrl(key: string, expiresIn?: number): Promise<string>;
}
