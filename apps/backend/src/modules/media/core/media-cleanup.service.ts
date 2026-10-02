import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaRepository } from './media.repository';
import { StorageService } from '@/infrastructure/storage/storage.service';
import { CLEANUP_BATCH_SIZE, PENDING_MEDIA_TTL_MS } from '../consts';

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);
  private running = false;

  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageService: StorageService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'media-cleanup' })
  async cleanupStalePending(): Promise<void> {
    if (this.running) return; // защита от наложения запусков
    this.running = true;

    try {
      const olderThan = new Date(Date.now() - PENDING_MEDIA_TTL_MS);
      let removed = 0;
      let failed = 0;
      let batch: Array<{ _id: { toString(): string }; key: string }>;

      do {
        batch = await this.mediaRepository.findStalePending(
          olderThan,
          CLEANUP_BATCH_SIZE,
        );
        let progress = 0;

        for (const item of batch) {
          try {
            // сначала объект, потом запись, если стор недоступен, запись остаётся до следующего запуска
            await this.storageService.delete(item.key);
            const result = await this.mediaRepository.deletePendingById(
              item._id.toString(),
            );
            if (result.deletedCount) removed++;
            progress++;
          } catch (err) {
            failed++;
            this.logger.error(
              `Failed to clean up media ${item._id.toString()}`,
              err as Error,
            );
          }
        }

        if (progress === 0) break; // ничего не удолось не крутимся вечно на одних и те х же записях
      } while (batch.length === CLEANUP_BATCH_SIZE);

      if (removed > 0 || failed > 0) {
        this.logger.log(
          `Media cleanup finished: removed=${removed}, failed=${failed}`,
        );
      }
    } finally {
      this.running = false;
    }
  }
}
