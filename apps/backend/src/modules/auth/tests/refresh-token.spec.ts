import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/common', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/common')>();
  return { ...actual, bcryptHash: vi.fn(), bcryptCompare: vi.fn() };
});

import { bcryptCompare, bcryptHash } from '@/common';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;

  let repository: {
    create: ReturnType<typeof vi.fn>;
    findByJti: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
    revokeByUserId: ReturnType<typeof vi.fn>;
    deleteExpired: ReturnType<typeof vi.fn>;
  };

  const userId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: RefreshTokenRepository,
          useValue: {
            create: vi.fn(),
            findByJti: vi.fn(),
            revoke: vi.fn(),
            revokeByUserId: vi.fn(),
            deleteExpired: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RefreshTokenService);
    repository = module.get(RefreshTokenRepository);

    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should store a hash of the token, not the token itself', async () => {
      const expiresAt = new Date('2026-10-05T12:00:00Z');
      const doc = { jti: 'jti-1' };
      vi.mocked(bcryptHash).mockResolvedValue('hashed-token');
      repository.create.mockResolvedValue(doc);

      const result = await service.create(
        userId,
        'jti-1',
        'raw-token',
        expiresAt,
      );

      expect(result).toBe(doc);
      expect(bcryptHash).toHaveBeenCalledWith('raw-token');

      const saved = repository.create.mock.calls[0][0];
      expect(saved.userId).toBeInstanceOf(Types.ObjectId);
      expect(saved.userId.toString()).toBe(userId);
      expect(saved).toMatchObject({
        jti: 'jti-1',
        tokenHash: 'hashed-token',
        expiresAt,
        revokedAt: null,
      });
      expect(JSON.stringify(saved)).not.toContain('raw-token');
    });
  });

  describe('findByJti', () => {
    it('should delegate to repository', async () => {
      const doc = { jti: 'jti-1' };
      repository.findByJti.mockResolvedValue(doc);

      const result = await service.findByJti('jti-1');

      expect(result).toBe(doc);
      expect(repository.findByJti).toHaveBeenCalledWith('jti-1');
    });

    it('should return null when token is unknown', async () => {
      repository.findByJti.mockResolvedValue(null);

      expect(await service.findByJti('missing')).toBeNull();
    });
  });

  describe('verify', () => {
    it('should return false without comparing when the token is no longer valid', async () => {
      const doc = {
        isValid: vi.fn().mockReturnValue(false),
        tokenHash: 'stored-hash',
      };

      const result = await service.verify('raw-token', doc as never);

      expect(result).toBe(false);
      expect(bcryptCompare).not.toHaveBeenCalled();
    });

    it('should return true when token is valid and hash matches', async () => {
      const doc = {
        isValid: vi.fn().mockReturnValue(true),
        tokenHash: 'stored-hash',
      };
      vi.mocked(bcryptCompare).mockResolvedValue(true);

      const result = await service.verify('raw-token', doc as never);

      expect(result).toBe(true);
      expect(bcryptCompare).toHaveBeenCalledWith('raw-token', 'stored-hash');
    });

    it('should return false when hash does not match', async () => {
      const doc = {
        isValid: vi.fn().mockReturnValue(true),
        tokenHash: 'stored-hash',
      };
      vi.mocked(bcryptCompare).mockResolvedValue(false);

      expect(await service.verify('other-token', doc as never)).toBe(false);
    });
  });

  describe('revoke', () => {
    it('should revoke by jti', async () => {
      repository.revoke.mockResolvedValue(undefined);

      await service.revoke('jti-1');

      expect(repository.revoke).toHaveBeenCalledWith('jti-1');
    });
  });

  describe('revokeAllByUserId', () => {
    it('should revoke every token of the user', async () => {
      repository.revokeByUserId.mockResolvedValue(undefined);

      await service.revokeAllByUserId(userId);

      expect(repository.revokeByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('cleanup', () => {
    it('should delete expired tokens', async () => {
      repository.deleteExpired.mockResolvedValue(undefined);

      await service.cleanup();

      expect(repository.deleteExpired).toHaveBeenCalledTimes(1);
    });
  });
});
