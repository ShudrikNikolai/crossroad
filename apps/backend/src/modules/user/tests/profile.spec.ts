import { ProfileRepository } from '../profile/profile.repository';
import { ProfileService } from '../profile/profile.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ProfileService', () => {
  let service: ProfileService;

  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    createProfile: ReturnType<typeof vi.fn>;
    updateByUserId: ReturnType<typeof vi.fn>;
    findPublicProfile: ReturnType<typeof vi.fn>;
    toProfilePublic: ReturnType<typeof vi.fn>;
    toProfilePrivate: ReturnType<typeof vi.fn>;
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
            findByUserId: vi.fn(),
            createProfile: vi.fn(),
            updateByUserId: vi.fn(),
            findPublicProfile: vi.fn(),
            toProfilePublic: vi.fn(),
            toProfilePrivate: vi.fn(),
          },
        },
        { provide: PinoLogger, useValue: logger },
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

      expect(repository.findOne).toHaveBeenCalledWith({ username: 'john' });
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

    it('should log and rethrow repository error', async () => {
      const error = new Error('Database error');
      repository.findOne.mockResolvedValue(null);
      repository.createProfile.mockRejectedValue(error);

      await expect(service.create('user-1', 'john')).rejects.toBe(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return the private profile via repository.toProfilePrivate', async () => {
      const rawProfile = { id: 'profile-1', username: 'john' };
      const privateProfile = { id: 'profile-1', username: 'john' };

      repository.findByUserId.mockResolvedValue(rawProfile);
      repository.toProfilePrivate.mockReturnValue(privateProfile);

      const result = await service.getMe('user-1');

      expect(result).toEqual(privateProfile);
      expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(repository.toProfilePrivate).toHaveBeenCalledWith(rawProfile);
    });

    it('should throw NotFoundException and log both warn and error when profile is missing', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.getMe('user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateMe', () => {
    it('should update and return the private profile', async () => {
      const updatedRaw = { id: 'profile-1', username: 'john-new' };
      const privateProfile = { id: 'profile-1', username: 'john-new' };
      const data = { username: 'john-new' };

      repository.updateByUserId.mockResolvedValue(updatedRaw);
      repository.toProfilePrivate.mockReturnValue(privateProfile);

      const result = await service.updateMe('user-1', data);

      expect(result).toEqual(privateProfile);
      expect(repository.updateByUserId).toHaveBeenCalledWith('user-1', data);
      expect(repository.toProfilePrivate).toHaveBeenCalledWith(updatedRaw);
    });

    it('should throw NotFoundException and log error when profile does not exist', async () => {
      repository.updateByUserId.mockResolvedValue(null);

      await expect(
        service.updateMe('user-1', { username: 'john' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getPublicProfile', () => {
    it('should return the public profile via repository.toProfilePublic', async () => {
      const rawProfile = { id: 'profile-1', username: 'john' };
      const publicProfile = { id: 'profile-1', username: 'john' };

      repository.findPublicProfile.mockResolvedValue(rawProfile);
      repository.toProfilePublic.mockReturnValue(publicProfile);

      const result = await service.getPublicProfile('profile-1');

      expect(result).toEqual(publicProfile);
      expect(repository.findPublicProfile).toHaveBeenCalledWith('profile-1');
      expect(repository.toProfilePublic).toHaveBeenCalledWith(rawProfile);
    });

    it('should throw NotFoundException when profile does not exist (no logging — no try/catch here)', async () => {
      repository.findPublicProfile.mockResolvedValue(null);

      await expect(
        service.getPublicProfile('profile-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
