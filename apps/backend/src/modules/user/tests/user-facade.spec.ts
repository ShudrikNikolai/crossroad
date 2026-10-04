import { UserRepository } from '../core/user.repository';
import { UserFacade } from '../facades/user.facade';
import { ProfileService } from '../profile/profile.service';
import { SecurityService } from '../security/security.service';
import { EventService } from '@/infrastructure/event/event.service';
import { MetricsService } from '@/infrastructure/observability/metrics.service';
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('UserFacade', () => {
  let service: UserFacade;

  let repository: {
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    createDocument: ReturnType<typeof vi.fn>;
  };
  let profileService: { create: ReturnType<typeof vi.fn> };
  let securityService: {
    createPassword: ReturnType<typeof vi.fn>;
    verifyPassword: ReturnType<typeof vi.fn>;
  };
  let eventService: { emit: ReturnType<typeof vi.fn> };
  let metricsService: { userRegistered: ReturnType<typeof vi.fn> };

  const logger = { setContext: vi.fn(), warn: vi.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserFacade,
        {
          provide: UserRepository,
          useValue: {
            findById: vi.fn(),
            findByEmail: vi.fn(),
            createDocument: vi.fn(),
          },
        },
        { provide: ProfileService, useValue: { create: vi.fn() } },
        {
          provide: SecurityService,
          useValue: { createPassword: vi.fn(), verifyPassword: vi.fn() },
        },
        { provide: EventService, useValue: { emit: vi.fn() } },
        { provide: MetricsService, useValue: { userRegistered: vi.fn() } },
        { provide: PinoLogger, useValue: logger },
      ],
    }).compile();

    service = module.get(UserFacade);
    repository = module.get(UserRepository);
    profileService = module.get(ProfileService);
    securityService = module.get(SecurityService);
    eventService = module.get(EventService);
    metricsService = module.get(MetricsService);

    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('should return public shape when user exists', async () => {
      repository.findById.mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
      });

      const result = await service.findById('user-1');

      expect(result).toEqual({ id: 'user-1', email: 'john@example.com' });
      expect(repository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException and log a warning when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return public shape when user exists', async () => {
      repository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
      });

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual({ id: 'user-1', email: 'john@example.com' });
      expect(repository.findByEmail).toHaveBeenCalledWith('john@example.com');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        service.findByEmail('john@example.com'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('verifyPassword', () => {
    it('should delegate to SecurityService', async () => {
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
    const data = {
      email: 'john@example.com',
      password: 'password',
      username: 'john',
      authMethod: 'email' as const,
    };

    it('should create user, password, profile, emit event and record the metric', async () => {
      repository.createDocument.mockResolvedValue({
        id: 'user-1',
        email: data.email,
      });
      securityService.createPassword.mockResolvedValue(true);
      profileService.create.mockResolvedValue(undefined);

      const result = await service.createUser(data);

      expect(result).toEqual({ id: 'user-1', email: data.email });

      expect(repository.createDocument).toHaveBeenCalledWith({
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
      expect(eventService.emit).toHaveBeenCalledWith('user.created', {
        userId: 'user-1',
        email: data.email,
      });
      expect(metricsService.userRegistered).toHaveBeenCalledTimes(1);
    });

    it('should not emit the event or record the metric when profile creation fails', async () => {
      const error = new Error('Profile creation failed');

      repository.createDocument.mockResolvedValue({
        id: 'user-1',
        email: data.email,
      });
      securityService.createPassword.mockResolvedValue(true);
      profileService.create.mockRejectedValue(error);

      await expect(service.createUser(data)).rejects.toBe(error);

      expect(eventService.emit).not.toHaveBeenCalled();
      expect(metricsService.userRegistered).not.toHaveBeenCalled();
    });

    it('should not emit the event or record the metric when password creation fails', async () => {
      const error = new Error('Password creation failed');

      repository.createDocument.mockResolvedValue({
        id: 'user-1',
        email: data.email,
      });
      securityService.createPassword.mockRejectedValue(error);
      profileService.create.mockResolvedValue(undefined);

      await expect(service.createUser(data)).rejects.toBe(error);

      expect(eventService.emit).not.toHaveBeenCalled();
      expect(metricsService.userRegistered).not.toHaveBeenCalled();
    });
  });
});
