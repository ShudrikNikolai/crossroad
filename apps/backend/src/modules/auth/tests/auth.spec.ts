import { Test, type TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigService } from '@/config';
import { EventService } from '@/infrastructure/event/event.service';
import { AuthService } from '../auth/auth.service';
import { UserAuthAdapter } from '../adapters/user.adapter';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

describe('AuthService', () => {
  let service: AuthService;

  let userAdapter: {
    findByEmail: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    verifyPassword: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
  };

  let refreshTokenService: {
    create: ReturnType<typeof vi.fn>;
    revoke: ReturnType<typeof vi.fn>;
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
  };

  const user = { id: 'user-1', email: 'john@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserAuthAdapter,
          useValue: {
            findByEmail: vi.fn(),
            findById: vi.fn(),
            verifyPassword: vi.fn(),
            createUser: vi.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            create: vi.fn(),
            revoke: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: vi.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            auth: {
              jwtSecret: 'access-secret',
              jwtRefreshSecret: 'refresh-secret',
              jwtAccessTtl: 900,
              jwtRefreshTtl: 604800, // 7 дней
            },
          },
        },
        {
          provide: EventService,
          useValue: { emitAsync: vi.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userAdapter = module.get(UserAuthAdapter);
    refreshTokenService = module.get(RefreshTokenService);
    jwtService = module.get(JwtService);

    vi.clearAllMocks();

    // порядок вызовов signAsync внутри Promise.all не должен влиять на тест
    jwtService.signAsync.mockImplementation(
      async (payload: { type: string }) =>
        payload.type === 'access' ? 'access-token' : 'refresh-token',
    );
    refreshTokenService.create.mockResolvedValue(undefined);
    refreshTokenService.revoke.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      userAdapter.findByEmail.mockResolvedValue(user);
      userAdapter.verifyPassword.mockResolvedValue(true);

      const result = await service.login('john@example.com', 'password');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        refreshJti: expect.any(String),
        expiresIn: 900,
        refreshExpiresIn: 604800,
        tokenType: 'Bearer',
      });

      expect(userAdapter.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(userAdapter.verifyPassword).toHaveBeenCalledWith(
        'user-1',
        'password',
      );
    });

    it('should sign access and refresh tokens with different secrets', async () => {
      userAdapter.findByEmail.mockResolvedValue(user);
      userAdapter.verifyPassword.mockResolvedValue(true);

      const result = await service.login('john@example.com', 'password');

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', type: 'access' },
        { secret: 'access-secret' },
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-1', jti: result.refreshJti, type: 'refresh' },
        { secret: 'refresh-secret' },
      );
    });

    it('should persist the refresh token with expiry = now + refresh TTL', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-28T12:00:00Z'));

      userAdapter.findByEmail.mockResolvedValue(user);
      userAdapter.verifyPassword.mockResolvedValue(true);

      const result = await service.login('john@example.com', 'password');

      expect(refreshTokenService.create).toHaveBeenCalledWith(
        'user-1',
        result.refreshJti,
        'refresh-token',
        new Date('2026-10-05T12:00:00Z'),
      );
    });

    it('should issue a unique jti for every login', async () => {
      userAdapter.findByEmail.mockResolvedValue(user);
      userAdapter.verifyPassword.mockResolvedValue(true);

      const first = await service.login('john@example.com', 'password');
      const second = await service.login('john@example.com', 'password');

      expect(first.refreshJti).not.toBe(second.refreshJti);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userAdapter.findByEmail.mockResolvedValue(null);

      await expect(
        service.login('nobody@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(userAdapter.verifyPassword).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on wrong password and issue nothing', async () => {
      userAdapter.findByEmail.mockResolvedValue(user);
      userAdapter.verifyPassword.mockResolvedValue(false);

      await expect(service.login('john@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(refreshTokenService.create).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should create user with email auth method and return tokens', async () => {
      userAdapter.createUser.mockResolvedValue(user);

      const result = await service.register({
        email: 'john@example.com',
        username: 'john',
        password: 'password',
      } as never);

      expect(userAdapter.createUser).toHaveBeenCalledWith({
        email: 'john@example.com',
        username: 'john',
        password: 'password',
        authMethod: 'email',
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should not forward extra fields (e.g. confirmPassword) to the adapter', async () => {
      userAdapter.createUser.mockResolvedValue(user);

      await service.register({
        email: 'john@example.com',
        username: 'john',
        password: 'password',
        confirmPassword: 'password',
      } as never);

      expect(userAdapter.createUser).toHaveBeenCalledWith({
        email: 'john@example.com',
        username: 'john',
        password: 'password',
        authMethod: 'email',
      });
    });

    it('should throw ConflictException when user already exists and issue no tokens', async () => {
      userAdapter.createUser.mockResolvedValue(null);

      await expect(
        service.register({
          email: 'john@example.com',
          username: 'john',
          password: 'password',
        } as never),
      ).rejects.toThrow(ConflictException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(refreshTokenService.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should revoke the old token before issuing a new pair', async () => {
      userAdapter.findById.mockResolvedValue(user);

      const result = await service.refresh('user-1', 'old-jti');

      expect(refreshTokenService.revoke).toHaveBeenCalledWith('old-jti');
      expect(refreshTokenService.create).toHaveBeenCalledTimes(1);
      expect(
        refreshTokenService.revoke.mock.invocationCallOrder[0],
      ).toBeLessThan(refreshTokenService.create.mock.invocationCallOrder[0]);

      expect(result.refreshJti).not.toBe('old-jti');
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException and issue nothing when user no longer exists', async () => {
      userAdapter.findById.mockResolvedValue(null);

      await expect(service.refresh('user-1', 'old-jti')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
      expect(refreshTokenService.create).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke the given refresh token', async () => {
      await service.logout('jti-1');

      expect(refreshTokenService.revoke).toHaveBeenCalledWith('jti-1');
    });
  });
});
