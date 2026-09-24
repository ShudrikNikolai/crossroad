import { Test, type TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileService } from '../profile/profile.service';
import { ProfileRepository } from '../profile/profile.repository';

describe('ProfileService', () => {
  let service: ProfileService;

  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    createProfile: ReturnType<typeof vi.fn>;
    updateByUserId: ReturnType<typeof vi.fn>;
    findPublicProfile: ReturnType<typeof vi.fn>;
  };

  const logger = {
    setContext: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: ProfileRepository,
          useValue: {
            findOne: vi.fn(),
            createProfile: vi.fn(),
            updateByUserId: vi.fn(),
            findPublicProfile: vi.fn(),
          },
        },
        {
          provide: PinoLogger,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get(ProfileService);
    repository = module.get(ProfileRepository);

    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create profile when username is available', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.createProfile.mockResolvedValue(undefined);

      await expect(service.create('user-1', 'john')).resolves.toBeUndefined();

      expect(repository.findOne).toHaveBeenCalledWith({
        username: 'john',
      });

      expect(repository.createProfile).toHaveBeenCalledWith('user-1', 'john');

      expect(logger.info).toHaveBeenCalledWith(
        'Profile created for user user-1',
      );
    });

    it('should throw ConflictException when username is taken', async () => {
      repository.findOne.mockResolvedValue({});

      await expect(service.create('user-1', 'john')).rejects.toBeInstanceOf(
        ConflictException,
      );

      expect(repository.createProfile).not.toHaveBeenCalled();
    });

    it('should rethrow repository error', async () => {
      const error = new Error('Database error');

      repository.findOne.mockResolvedValue(null);
      repository.createProfile.mockRejectedValue(error);

      await expect(service.create('user-1', 'john')).rejects.toBe(error);

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return private profile', async () => {
      const privateProfile = {
        id: 'profile-1',
        username: 'john',
      };

      const profile = {
        toPrivate: vi.fn().mockReturnValue(privateProfile),
      };

      repository.findOne.mockResolvedValue(profile);

      const result = await service.getMe('user-1');

      expect(result).toEqual(privateProfile);

      expect(repository.findOne).toHaveBeenCalledWith({
        userId: 'user-1',
      });

      expect(profile.toPrivate).toHaveBeenCalled();
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getMe('user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('updateMe', () => {
    it('should update and return private profile', async () => {
      const privateProfile = {
        id: 'profile-1',
        username: 'john-new',
      };

      const profile = {
        toPrivate: vi.fn().mockReturnValue(privateProfile),
      };

      const data = {
        username: 'john-new',
      };

      repository.updateByUserId.mockResolvedValue(profile);

      const result = await service.updateMe('user-1', data);

      expect(result).toEqual(privateProfile);

      expect(repository.updateByUserId).toHaveBeenCalledWith('user-1', data);

      expect(profile.toPrivate).toHaveBeenCalled();
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      repository.updateByUserId.mockResolvedValue(null);

      await expect(
        service.updateMe('user-1', {
          username: 'john',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getPublicProfile', () => {
    it('should return public profile', async () => {
      const publicProfile = {
        id: 'profile-1',
        username: 'john',
      };

      const profile = {
        toPublic: vi.fn().mockReturnValue(publicProfile),
      };

      repository.findPublicProfile.mockResolvedValue(profile);

      const result = await service.getPublicProfile('profile-1');

      expect(result).toEqual(publicProfile);

      expect(repository.findPublicProfile).toHaveBeenCalledWith('profile-1');

      expect(profile.toPublic).toHaveBeenCalled();
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      repository.findPublicProfile.mockResolvedValue(null);

      await expect(
        service.getPublicProfile('profile-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
