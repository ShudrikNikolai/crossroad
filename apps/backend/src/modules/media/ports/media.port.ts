export interface IMediaPort {
  getUrl(key: string): Promise<string>;
  /** Бросает ошибку, если ключ не подтверждён или принадлежит другому пользователю */
  assertOwnedConfirmed(key: string, userId: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export const MEDIA_PORT = Symbol('MEDIA_PORT');
