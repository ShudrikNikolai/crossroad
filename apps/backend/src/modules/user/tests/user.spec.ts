import { UserRepository } from '../core/user.repository';
import { UserService } from '../core/user.service';
import { Test, type TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('UserService', () => {
  let service: UserService;
  let repository: { updateById: ReturnType<typeof vi.fn> };

  const logger = { setContext: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: { updateById: vi.fn() } },
        { provide: PinoLogger, useValue: logger },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(UserRepository);

    vi.clearAllMocks();
  });

  describe('updatePhoneNumber', () => {
    it('should return true when user was updated', async () => {
      repository.updateById.mockResolvedValue({});

      const result = await service.updatePhoneNumber('user-1', {} as never);

      expect(result).toBe(true);
      expect(repository.updateById).toHaveBeenCalledWith('user-1', {});
    });

    it('should return false when user was not updated', async () => {
      repository.updateById.mockResolvedValue(null);

      const result = await service.updatePhoneNumber('user-1', {} as never);

      expect(result).toBe(false);
    });

    it('should return false and log when repository throws', async () => {
      repository.updateById.mockRejectedValue(new Error('db error'));

      const result = await service.updatePhoneNumber('user-1', {} as never);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateEmail', () => {
    it('should return true when user was updated', async () => {
      repository.updateById.mockResolvedValue({});

      const result = await service.updateEmail('user-1', {} as never);

      expect(result).toBe(true);
      expect(repository.updateById).toHaveBeenCalledWith('user-1', {});
    });

    it('should return false when user was not updated', async () => {
      repository.updateById.mockResolvedValue(null);

      const result = await service.updateEmail('user-1', {} as never);

      expect(result).toBe(false);
    });

    it('should return false and log when repository throws', async () => {
      repository.updateById.mockRejectedValue(new Error('db error'));

      const result = await service.updateEmail('user-1', {} as never);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
