import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaCleanupService } from '../core/media-cleanup.service';
import { MediaRepository } from '../core/media.repository';
import { StorageService } from '@/infrastructure/storage/storage.service';

const oid = (value: string) => ({ toString: () => value });

describe('MediaCleanupService', () => {
  let service: MediaCleanupService;

  let repository: {
    findStalePending: ReturnType<typeof vi.fn>;
    deletePendingById: ReturnType<typeof vi.fn>;
  };
  let storage: { delete: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaCleanupService,
        {
          provide: MediaRepository,
          useValue: { findStalePending: vi.fn(), deletePendingById: vi.fn() },
        },
        { provide: StorageService, useValue: { delete: vi.fn() } },
      ],
    }).compile();

    service = module.get(MediaCleanupService);
    repository = module.get(MediaRepository);
    storage = module.get(StorageService);

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delete stale pending objects and their records', async () => {
    repository.findStalePending.mockResolvedValueOnce([
      { _id: oid('m1'), key: 'k1' },
      { _id: oid('m2'), key: 'k2' },
    ]);
    storage.delete.mockResolvedValue(undefined);
    repository.deletePendingById.mockResolvedValue({ deletedCount: 1 });

    await service.cleanupStalePending();

    expect(storage.delete).toHaveBeenCalledWith('k1');
    expect(storage.delete).toHaveBeenCalledWith('k2');
    expect(repository.deletePendingById).toHaveBeenCalledWith('m1');
    expect(repository.deletePendingById).toHaveBeenCalledWith('m2');
  });

  it('should use a 24h cutoff', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T12:00:00Z'));
    repository.findStalePending.mockResolvedValue([]);

    await service.cleanupStalePending();

    expect(repository.findStalePending).toHaveBeenCalledWith(
      new Date('2026-09-27T12:00:00Z'),
      100,
    );
  });

  it('should keep the record when storage delete fails and continue with the rest', async () => {
    repository.findStalePending.mockResolvedValueOnce([
      { _id: oid('m1'), key: 'k1' },
      { _id: oid('m2'), key: 'k2' },
    ]);
    storage.delete
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined);
    repository.deletePendingById.mockResolvedValue({ deletedCount: 1 });

    await service.cleanupStalePending();

    expect(repository.deletePendingById).toHaveBeenCalledTimes(1);
    expect(repository.deletePendingById).toHaveBeenCalledWith('m2');
  });

  it('should stop instead of looping forever when nothing can be deleted', async () => {
    const fullBatch = Array.from({ length: 100 }, (_, i) => ({
      _id: oid(`m${i}`),
      key: `k${i}`,
    }));
    repository.findStalePending.mockResolvedValue(fullBatch);
    storage.delete.mockRejectedValue(new Error('storage down'));

    await service.cleanupStalePending();

    expect(repository.findStalePending).toHaveBeenCalledTimes(1);
  });

  it('should not run concurrently with itself', async () => {
    let release!: () => void;
    repository.findStalePending.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = () => resolve([]);
        }),
    );

    const first = service.cleanupStalePending();
    await service.cleanupStalePending(); // второй вызов возвращается сразу
    release();
    await first;

    expect(repository.findStalePending).toHaveBeenCalledTimes(1);
  });
});
