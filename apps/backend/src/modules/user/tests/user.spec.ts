import { Test, type TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EventService } from '@/infrastructure/event/event.service';
import { ProfileService } from '../profile/profile.service';
import { SecurityService } from '../security/security.service';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';

describe('UserService', () => {
  let service: UserService;

  let repository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    updateById: ReturnType<typeof vi.fn>;
  };

  let profileService: {
    create: ReturnType<typeof vi.fn>;
  };

  let securityService: {
    createPassword: ReturnType<typeof vi.fn>;
    verifyPassword: ReturnType<typeof vi.fn>;
  };

  let eventService: {
    emitAsync: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: vi.fn(),
            findById: vi.fn(),
            findByEmail: vi.fn(),
            updateById: vi.fn(),
          },
        },
        {
          provide: ProfileService,
          useValue: {
            create: vi.fn(),
          },
        },
        {
          provide: SecurityService,
          useValue: {
            createPassword: vi.fn(),
            verifyPassword: vi.fn(),
          },
        },
        {
          provide: EventService,
          useValue: {
            emitAsync: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserService);

    repository = module.get(UserRepository);
    profileService = module.get(ProfileService);
    securityService = module.get(SecurityService);
    eventService = module.get(EventService);

    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should return public user when user exists', async () => {
      repository.findById.mockResolvedValue({
        _id: {
          toString: () => 'user-1',
        },
        email: 'john@example.com',
      });

      const result = await service.findById('user-1');

      expect(result).toEqual({
        id: 'user-1',
        email: 'john@example.com',
      });

      expect(repository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should return null when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('user-1');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return public user when user exists', async () => {
      repository.findByEmail.mockResolvedValue({
        _id: {
          toString: () => 'user-1',
        },
        email: 'john@example.com',
      });

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual({
        id: 'user-1',
        email: 'john@example.com',
      });

      expect(repository.findByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should return null when user does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('john@example.com');

      expect(result).toBeNull();
    });
  });

  describe('verifyPassword', () => {
    it('should delegate verification to SecurityService', async () => {
      securityService.verifyPassword.mockResolvedValue(true);

      const result = await service.verifyPassword('user-1', 'password');

      expect(result).toBe(true);

      expect(securityService.verifyPassword).toHaveBeenCalledWith(
        'user-1',
        'password',
      );
    });
  });

  describe('createUser', () => {
    it('should create user, password, profile and emit event', async () => {
      const userId = {
        toString: () => 'user-1',
      };

      const user = {
        _id: userId,
        email: 'john@example.com',
      };

      const data = {
        email: 'john@example.com',
        password: 'password',
        username: 'john',
      };

      repository.create.mockResolvedValue(user);
      securityService.createPassword.mockResolvedValue(true);
      profileService.create.mockResolvedValue(undefined);
      eventService.emitAsync.mockResolvedValue([]);

      const result = await service.createUser(data);

      expect(result).toEqual({
        id: 'user-1',
        email: 'john@example.com',
      });

      expect(repository.create).toHaveBeenCalledWith({
        email: data.email,
        isActive: true,
      });

      expect(securityService.createPassword).toHaveBeenCalledWith(
        'user-1',
        data.password,
      );

      expect(profileService.create).toHaveBeenCalledWith(
        'user-1',
        data.username,
      );

      expect(eventService.emitAsync).toHaveBeenCalledWith('user.created', {
        userId,
        email: user.email,
      });
    });

    it('should not emit event when profile creation fails', async () => {
      const user = {
        _id: {
          toString: () => 'user-1',
        },
        email: 'john@example.com',
      };

      const error = new Error('Profile creation failed');

      repository.create.mockResolvedValue(user);
      securityService.createPassword.mockResolvedValue(true);
      profileService.create.mockRejectedValue(error);

      await expect(
        service.createUser({
          email: 'john@example.com',
          password: 'password',
          username: 'john',
        }),
      ).rejects.toBe(error);

      expect(eventService.emitAsync).not.toHaveBeenCalled();
    });
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
  });
});
