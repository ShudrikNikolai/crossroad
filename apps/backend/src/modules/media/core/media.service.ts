import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { MediaRepository } from './media.repository';
import { StorageService } from '@/infrastructure/storage/storage.service';
import { type IStoryPort, STORY_PORT } from '@/modules/story/ports/story.port';
import type { IMediaPort } from '../ports/media.port';
import {
  EXTENSION_BY_CONTENT_TYPE,
  MEDIA_RULES,
  MEDIA_URL_TTL_SECONDS,
  UPLOAD_URL_TTL_SECONDS,
} from '../consts';
import type {
  TCreateUploadUrlSchema,
  TMediaResponse,
  TUploadUrlResponse,
} from '@crossroad/schemas';
import { API_MEDIA_ERROR } from '@/common';
import type { MediaDocument } from './media.model';
@Injectable()
export class MediaService implements IMediaPort {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageService: StorageService,
    @Inject(STORY_PORT) private readonly storyPort: IStoryPort,
  ) {}

  async createUploadUrl(
    userId: string,
    data: TCreateUploadUrlSchema,
  ): Promise<TUploadUrlResponse> {
    const rules = MEDIA_RULES[data.purpose];

    if (!(rules.allowedTypes as readonly string[]).includes(data.contentType)) {
      throw new BadRequestException(API_MEDIA_ERROR.UNSUPPORTED_CONTENT_TYPE);
    }
    if (data.size > rules.maxSizeBytes) {
      throw new BadRequestException(API_MEDIA_ERROR.FILE_TOO_LARGE);
    }
    if (data.purpose === 'story-media') {
      await this.storyPort.assertEditable(data.storyId!, userId);
    }

    const key = this.buildKey(userId, data);

    const policy = await this.storageService.getUploadPolicy({
      key,
      contentType: data.contentType,
      maxSizeBytes: data.size, // потолок = заявленный размер, а не максимум по правилам
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    });

    const media = await this.mediaRepository.create({
      ownerId: userId as any,
      purpose: data.purpose,
      storyId: data.storyId as any,
      key,
      contentType: data.contentType,
      size: data.size,
    });

    return {
      mediaId: media._id.toString(),
      url: policy.url,
      fields: policy.fields,
    };
  }

  async confirm(userId: string, mediaId: string): Promise<TMediaResponse> {
    let media = await this.mediaRepository.findById(mediaId);
    if (!media) throw new NotFoundException(API_MEDIA_ERROR.NOT_FOUND);
    if (media.ownerId.toString() !== userId)
      throw new ForbiddenException(API_MEDIA_ERROR.NOT_OWNER);

    if (media.status !== 'confirmed') {
      const uploaded = await this.storageService.exists(media.key);
      if (!uploaded)
        throw new BadRequestException(API_MEDIA_ERROR.UPLOAD_NOT_FOUND);
      media = (await this.mediaRepository.markConfirmed(mediaId))!;
    }

    return this.toResponse(media);
  }

  getUrl(key: string): Promise<string> {
    return this.storageService.getUrl(key, MEDIA_URL_TTL_SECONDS);
  }

  async assertOwnedConfirmed(key: string, userId: string): Promise<void> {
    const media = await this.mediaRepository.findByKey(key);
    if (!media || media.status !== 'confirmed')
      throw new NotFoundException(API_MEDIA_ERROR.NOT_FOUND);
    if (media.ownerId.toString() !== userId)
      throw new ForbiddenException(API_MEDIA_ERROR.NOT_OWNER);
  }

  async delete(key: string): Promise<void> {
    await this.storageService.delete(key);
    await this.mediaRepository.deleteByKey(key);
  }

  private buildKey(userId: string, data: TCreateUploadUrlSchema): string {
    const ext = EXTENSION_BY_CONTENT_TYPE[data.contentType];
    const prefix =
      data.purpose === 'avatar'
        ? `avatars/${userId}`
        : `stories/${data.storyId}`;
    return `${prefix}/${randomUUID()}.${ext}`;
  }

  private async toResponse(media: MediaDocument): Promise<TMediaResponse> {
    return {
      id: media._id.toString(),
      key: media.key,
      purpose: media.purpose,
      status: media.status,
      contentType: media.contentType,
      url:
        media.status === 'confirmed' ? await this.getUrl(media.key) : undefined,
      createdAt: media.createdAt.toISOString(),
    };
  }
}
