import { SecurityRepository } from '../security/security.repository';
import { SecurityService } from '../security/security.service';
import { bcryptCompare, bcryptHash } from '@/common';
import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/common', async () => {
  const actual = await vi.importActual<typeof import('@/common')>('@/common');
  return { ...actual, bcryptCompare: vi.fn(), bcryptHash: vi.fn() };
});

describe('SecurityService', () => {
  let service: SecurityService;
  let repository: {
    createSecurity: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    updateSecurity: ReturnType<typeof vi.fn>;
  };

  const logger = {
    setContext: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: SecurityRepository,
          useValue: {
            createSecurity: vi.fn(),
            findByUserId: vi.fn(),
            updateSecurity: vi.fn(),
          },
        },
        { provide: PinoLogger, useValue: logger },
      ],
    }).compile();

    service = module.get(SecurityService);
    repository = module.get(SecurityRepository);

    vi.clearAllMocks();
  });

  describe('createPassword', () => {
    it('should hash password and create security record', async () => {
      vi.mocked(bcryptHash).mockResolvedValue('hashed-password');
      repository.createSecurity.mockResolvedValue(undefined);

      const result = await service.createPassword('user-1', 'password');

      expect(result).toBe(true);
      expect(bcryptHash).toHaveBeenCalledWith('password');
      expect(repository.createSecurity).toHaveBeenCalledWith(
        'user-1',
        'hashed-password',
      );
    });

    it('should throw UnauthorizedException when creation fails', async () => {
      vi.mocked(bcryptHash).mockRejectedValue(new Error('bcrypt error'));

      await expect(
        service.createPassword('user-1', 'password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('verifyPassword', () => {
    it('should return true for valid password', async () => {
      repository.findByUserId.mockResolvedValue({
        passwordHash: 'hashed-password',
      });
      vi.mocked(bcryptCompare).mockResolvedValue(true);

      const result = await service.verifyPassword('user-1', 'password');

      expect(result).toBe(true);
      expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(bcryptCompare).toHaveBeenCalledWith('password', 'hashed-password');
    });

    it('should return false for invalid password', async () => {
      repository.findByUserId.mockResolvedValue({
        passwordHash: 'hashed-password',
      });
      vi.mocked(bcryptCompare).mockResolvedValue(false);

      const result = await service.verifyPassword('user-1', 'wrong-password');

      expect(result).toBe(false);
    });

    it('should throw when security record does not exist', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(
        service.verifyPassword('user-1', 'password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(bcryptCompare).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should verify old password, hash and store the new one', async () => {
      vi.spyOn(service, 'verifyPassword').mockResolvedValue(true);
      vi.mocked(bcryptHash).mockResolvedValue('new-hashed-password');
      repository.updateSecurity.mockResolvedValue(undefined);

      const result = await service.updatePassword('user-1', {
        oldPassword: 'old-pass',
        newPassword: 'new-pass',
      });

      expect(result).toBe(true);
      expect(service.verifyPassword).toHaveBeenCalledWith('user-1', 'old-pass');
      expect(bcryptHash).toHaveBeenCalledWith('new-pass');
      expect(repository.updateSecurity).toHaveBeenCalledWith(
        'user-1',
        'new-hashed-password',
      );
    });

    it('should throw UnauthorizedException when old password is wrong', async () => {
      vi.spyOn(service, 'verifyPassword').mockResolvedValue(false);

      await expect(
        service.updatePassword('user-1', {
          oldPassword: 'wrong',
          newPassword: 'new-pass',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(repository.updateSecurity).not.toHaveBeenCalled();
      expect(bcryptHash).not.toHaveBeenCalled();
    });

    it('should propagate the error when the security record does not exist', async () => {
      vi.spyOn(service, 'verifyPassword').mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(
        service.updatePassword('user-1', {
          oldPassword: 'old',
          newPassword: 'new-pass',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(repository.updateSecurity).not.toHaveBeenCalled();
    });
  });
});
