import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { User, InviteCode } from '@ordo-todo/core';
import { AuthService } from './auth.service';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { TokenBlacklistService } from './token-blacklist.service';
import { PlanLifecycleService } from '../billing/plan-lifecycle.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthAuditService } from './auth-audit.service';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let tokenBlacklistService: TokenBlacklistService;

  // ODD 019: REGISTRATION_MODE as the service would read it (null = default
  // invite-only). Existing register tests run in 'open'.
  let registrationMode: string | null = null;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    findByProvider: jest.fn(),
    linkOAuthAccount: jest.fn(),
    updateProps: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockInviteCodeRepository = {
    save: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    listAll: jest.fn(),
    consume: jest.fn(),
    release: jest.fn(),
    recordRedemption: jest.fn(),
    findRedemptionByUserId: jest.fn(),
    countRedemptions: jest.fn(),
  };

  const mockCryptoProvider = {
    encrypt: jest.fn(),
    compare: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'REGISTRATION_MODE') return registrationMode;
      if (key === 'JWT_SECRET') return 'test-secret-key';
      if (key === 'JWT_EXPIRATION') return '1h';
      if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
      return null;
    }),
  };

  const mockWorkspacesService = {
    create: jest.fn(),
  };

  const mockTokenBlacklistService = {
    blacklist: jest.fn(),
    isBlacklisted: jest.fn(),
  };

  const mockAuthAuditService = {
    loginSuccess: jest.fn().mockResolvedValue(undefined),
    loginFailed: jest.fn().mockResolvedValue(undefined),
    registerSuccess: jest.fn().mockResolvedValue(undefined),
    registerFailed: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    refreshToken: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    registrationMode = 'open';
    Object.values(mockInviteCodeRepository).forEach((fn) => fn.mockReset());
    mockInviteCodeRepository.release.mockResolvedValue(undefined);
    mockInviteCodeRepository.findRedemptionByUserId.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockReset();
    mockUserRepository.findByUsername.mockReset().mockResolvedValue(null);
    mockUserRepository.save.mockReset().mockResolvedValue(undefined);
    mockUserRepository.create.mockReset();
    mockCryptoProvider.encrypt.mockReset();
    mockCryptoProvider.compare.mockReset();
    mockTokenBlacklistService.blacklist
      .mockReset()
      .mockResolvedValue(undefined);
    mockTokenBlacklistService.isBlacklisted
      .mockReset()
      .mockResolvedValue(false);
    mockAuthAuditService.loginSuccess.mockReset().mockResolvedValue(undefined);
    mockAuthAuditService.loginFailed.mockReset().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'InviteCodeRepository',
          useValue: mockInviteCodeRepository,
        },
        {
          provide: BcryptCryptoProvider,
          useValue: mockCryptoProvider,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(
              (payload: { sub: string }) => `mock-token-${payload.sub}`,
            ),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WorkspacesService,
          useValue: mockWorkspacesService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
        },
        {
          provide: AuthAuditService,
          useValue: mockAuthAuditService,
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue({ success: true }),
            sendWorkspaceInvitation: jest
              .fn()
              .mockResolvedValue({ success: true }),
            sendPasswordReset: jest.fn().mockResolvedValue({ success: true }),
            sendWelcome: jest.fn().mockResolvedValue({ success: true }),
          },
        },
        {
          provide: PlanLifecycleService,
          useValue: {
            startTrialForNewUser: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(
      TokenBlacklistService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    const validHash =
      '$2b$10$epRnT3MmKDDW.4Q6D9m9euO059y/qJ0k/1Zq6e4D2xY4oZ7hU8P32';

    it('should successfully register a new user', async () => {
      const mockCreatedUser = new User(
        {
          id: 'user-123',
          email: registerDto.email,
          username: registerDto.username,
          name: registerDto.name,
          password: validHash,
        },
        'draft',
      );
      mockUserRepository.findByEmail
        .mockResolvedValueOnce(null) // duplicate check inside RegisterUser
        .mockResolvedValueOnce(mockCreatedUser) // trial hook (ODD 012 S5)
        .mockResolvedValueOnce(mockCreatedUser); // login lookup
      mockCryptoProvider.encrypt.mockResolvedValue(validHash);
      mockCryptoProvider.compare.mockResolvedValue(true);

      const result = await service.register(registerDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockCryptoProvider.encrypt).toHaveBeenCalledWith(
        registerDto.password,
      );
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        username: mockCreatedUser.username,
        name: mockCreatedUser.name,
      });
    });

    it('el trial fallando NO rompe el registro (ODD 012 S5)', async () => {
      const trialUser = new User(
        {
          id: 'user-trial',
          email: registerDto.email,
          username: registerDto.username,
          name: registerDto.name,
          password: validHash,
        },
        'draft',
      );
      mockUserRepository.findByEmail
        .mockResolvedValueOnce(null) // duplicate check
        .mockResolvedValueOnce(trialUser) // trial hook
        .mockResolvedValueOnce(trialUser); // login lookup
      mockCryptoProvider.encrypt.mockResolvedValue(validHash);
      mockCryptoProvider.compare.mockResolvedValue(true);
      const lifecycle = (
        service as unknown as {
          planLifecycle: { startTrialForNewUser: jest.Mock };
        }
      ).planLifecycle;
      lifecycle.startTrialForNewUser.mockRejectedValueOnce(
        new Error('trial down'),
      );

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(lifecycle.startTrialForNewUser).toHaveBeenCalledWith(trialUser.id);
    });

    it('should throw ConflictException when email already exists', async () => {
      const existingUser = new User(
        {
          id: 'existing-user',
          email: registerDto.email,
          username: 'existinguser',
          name: 'Existing',
        },
        'draft',
      );
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('register with invitation (ODD 019 S2)', () => {
    const registerDto: RegisterDto = {
      email: 'invited@example.com',
      username: 'inviteduser',
      password: 'SecurePass123!',
      name: 'Invited User',
      inviteCode: 'ORDO-7KM2-QP9X',
    };

    const validHash =
      '$2b$10$epRnT3MmKDDW.4Q6D9m9euO059y/qJ0k/1Zq6e4D2xY4oZ7hU8P32';

    const invite = (overrides: Record<string, unknown> = {}) =>
      new InviteCode({
        code: 'ORDO-7KM2-QP9X',
        maxUses: 1,
        usedCount: 0,
        isActive: true,
        ...overrides,
      });

    const createdUser = () =>
      new User(
        {
          id: 'user-new',
          email: registerDto.email,
          username: registerDto.username,
          name: registerDto.name,
          password: validHash,
        },
        'draft',
      );

    const expectHttpError = async (
      promise: Promise<unknown>,
      status: number,
      code: string,
    ) => {
      const error = (await promise.catch((e: unknown) => e)) as HttpException;
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(status);
      expect(error.getResponse()).toMatchObject({ code });
    };

    beforeEach(() => {
      registrationMode = null; // default: invite-only
    });

    it('consumes the code, registers and records the redemption', async () => {
      const code = invite();
      const user = createdUser();
      mockInviteCodeRepository.findByCode.mockResolvedValue(code);
      mockInviteCodeRepository.consume.mockResolvedValue(true);
      mockInviteCodeRepository.findById.mockResolvedValue(code);
      mockUserRepository.findByEmail
        .mockResolvedValueOnce(null) // duplicate check inside RegisterUser
        .mockResolvedValueOnce(user) // redemption lookup
        .mockResolvedValueOnce(user) // trial hook (ODD 012 S5)
        .mockResolvedValueOnce(user); // login lookup
      mockCryptoProvider.encrypt.mockResolvedValue(validHash);
      mockCryptoProvider.compare.mockResolvedValue(true);

      const result = await service.register(registerDto);

      expect(mockInviteCodeRepository.consume).toHaveBeenCalledWith(
        code.id,
        expect.any(Date),
      );
      expect(mockInviteCodeRepository.recordRedemption).toHaveBeenCalledWith(
        code.id,
        user.id,
      );
      expect(mockInviteCodeRepository.release).not.toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
    });

    it('rejects a missing code with INVITE_INVALID before touching users', async () => {
      await expectHttpError(
        service.register({ ...registerDto, inviteCode: '  ' }),
        HttpStatus.BAD_REQUEST,
        'INVITE_INVALID',
      );
      expect(mockInviteCodeRepository.findByCode).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it.each([
      ['unknown', null, HttpStatus.BAD_REQUEST, 'INVITE_INVALID'],
      [
        'inactive',
        { isActive: false },
        HttpStatus.BAD_REQUEST,
        'INVITE_INACTIVE',
      ],
      [
        'expired',
        { expiresAt: new Date('2026-01-01T00:00:00.000Z') },
        HttpStatus.GONE,
        'INVITE_EXPIRED',
      ],
      [
        'exhausted',
        { usedCount: 1 },
        HttpStatus.BAD_REQUEST,
        'INVITE_EXHAUSTED',
      ],
    ] as const)(
      'maps an %s code to %i/%s and never creates the user',
      async (_name, overrides, status, machineCode) => {
        mockInviteCodeRepository.findByCode.mockResolvedValue(
          overrides === null ? null : invite(overrides),
        );

        await expectHttpError(
          service.register(registerDto),
          status,
          machineCode,
        );

        expect(mockInviteCodeRepository.consume).not.toHaveBeenCalled();
        expect(mockUserRepository.save).not.toHaveBeenCalled();
      },
    );

    it('treats a lost consume race as INVITE_EXHAUSTED', async () => {
      mockInviteCodeRepository.findByCode.mockResolvedValue(invite());
      mockInviteCodeRepository.consume.mockResolvedValue(false);

      await expectHttpError(
        service.register(registerDto),
        HttpStatus.BAD_REQUEST,
        'INVITE_EXHAUSTED',
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('refunds the consumed use when the registration itself fails', async () => {
      const code = invite();
      mockInviteCodeRepository.findByCode.mockResolvedValue(code);
      mockInviteCodeRepository.consume.mockResolvedValue(true);
      mockInviteCodeRepository.findById.mockResolvedValue(code);
      mockUserRepository.findByEmail.mockResolvedValue(
        new User(
          {
            id: 'existing',
            email: registerDto.email,
            username: 'existing',
            name: 'Existing',
          },
          'draft',
        ),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockInviteCodeRepository.release).toHaveBeenCalledWith(code.id);
      expect(mockInviteCodeRepository.recordRedemption).not.toHaveBeenCalled();
    });

    it('ignores the code entirely when REGISTRATION_MODE=open', async () => {
      registrationMode = 'open';
      const user = createdUser();
      mockUserRepository.findByEmail
        .mockResolvedValueOnce(null) // duplicate check inside RegisterUser
        .mockResolvedValueOnce(user) // trial hook (ODD 012 S5)
        .mockResolvedValueOnce(user); // login lookup
      mockCryptoProvider.encrypt.mockResolvedValue(validHash);
      mockCryptoProvider.compare.mockResolvedValue(true);

      await service.register(registerDto);

      expect(mockInviteCodeRepository.findByCode).not.toHaveBeenCalled();
      expect(mockInviteCodeRepository.consume).not.toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('oauthLogin with the invitation gate (ODD 019 S2 / A1)', () => {
    const oauthDto = {
      provider: 'google' as const,
      providerId: 'google-1',
      email: 'social@example.com',
      name: 'Social User',
    };

    it('rejects a brand-new social account while invite-only', async () => {
      registrationMode = null;
      mockUserRepository.findByProvider.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const error = (await service
        .oauthLogin(oauthDto)
        .catch((e: unknown) => e)) as HttpException;

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect(error.getResponse()).toMatchObject({
        code: 'REGISTRATION_INVITE_ONLY',
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('still links the provider to an existing account while invite-only', async () => {
      registrationMode = null;
      const existing = new User(
        {
          id: 'user-existing',
          email: oauthDto.email,
          username: 'existing',
          name: 'Existing',
        },
        'draft',
      );
      mockUserRepository.findByProvider.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(existing);
      mockUserRepository.linkOAuthAccount.mockResolvedValue(existing);

      const result = await service.oauthLogin(oauthDto);

      expect(mockUserRepository.linkOAuthAccount).toHaveBeenCalledWith(
        existing.id,
        'google',
        'google-1',
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
    });

    it('creates the social account when the mode is open', async () => {
      registrationMode = 'open';
      const created = new User(
        {
          id: 'user-social',
          email: oauthDto.email,
          username: 'socialabc123',
          name: oauthDto.name,
        },
        'draft',
      );
      mockUserRepository.findByProvider.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(created);
      mockWorkspacesService.create.mockResolvedValue({ id: 'ws-1' });

      const result = await service.oauthLogin(oauthDto);

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('blocked accounts (ODD 019 S3)', () => {
    const validHash =
      '$2b$10$epRnT3MmKDDW.4Q6D9m9euO059y/qJ0k/1Zq6e4D2xY4oZ7hU8P32';

    const accountWithStatus = (status: 'ACTIVE' | 'BLOCKED') =>
      new User(
        {
          id: 'user-9',
          email: 'blocked@example.com',
          username: 'blocked',
          name: 'Blocked',
          password: validHash,
          status,
        },
        'draft',
      );

    it('rejects login for a BLOCKED account with ACCOUNT_BLOCKED', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        accountWithStatus('BLOCKED'),
      );
      mockCryptoProvider.compare.mockResolvedValue(true);

      const error = (await service
        .login({ email: 'blocked@example.com', password: 'SecurePass123!' })
        .catch((e: unknown) => e)) as HttpException;

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.getResponse()).toMatchObject({ code: 'ACCOUNT_BLOCKED' });
      expect(mockAuthAuditService.loginFailed).toHaveBeenCalled();
    });

    it('validateUser returns null for a BLOCKED account (kills live tokens)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        accountWithStatus('BLOCKED'),
      );

      expect(await service.validateUser('blocked@example.com')).toBeNull();
    });

    it('refresh rejects a BLOCKED account (N1: transitive via validateUser)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        accountWithStatus('BLOCKED'),
      );
      (jwtService.verify as jest.Mock).mockResolvedValueOnce({
        email: 'blocked@example.com',
        tokenType: 'refresh',
      });

      await expect(
        service.refresh('valid-refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('a successful login stamps lastLoginAt', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        accountWithStatus('ACTIVE'),
      );
      mockCryptoProvider.compare.mockResolvedValue(true);
      mockUserRepository.updateProps.mockResolvedValue(undefined);

      await service.login({
        email: 'blocked@example.com',
        password: 'SecurePass123!',
      });

      expect(mockUserRepository.updateProps).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-9' }),
        { lastLoginAt: expect.any(Date) },
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    const validHash =
      '$2b$10$epRnT3MmKDDW.4Q6D9m9euO059y/qJ0k/1Zq6e4D2xY4oZ7hU8P32';

    it('should successfully login with valid credentials', async () => {
      const mockUser = new User(
        {
          id: 'user-123',
          email: loginDto.email,
          password: validHash,
          username: 'testuser',
          name: 'Test User',
        },
        'draft',
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockCryptoProvider.compare.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
        true,
      );
      expect(mockCryptoProvider.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        name: mockUser.name,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = new User(
        {
          id: 'user-123',
          email: loginDto.email,
          password: validHash,
          username: 'testuser',
          name: 'Test User',
        },
        'draft',
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockCryptoProvider.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('logout', () => {
    it('should successfully blacklist a token', async () => {
      const token = 'valid-access-token';

      await service.logout(token);

      expect(tokenBlacklistService.blacklist).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException when blacklist fails', async () => {
      const token = 'valid-access-token';
      mockTokenBlacklistService.blacklist.mockRejectedValue(
        new Error('Blacklist service error'),
      );

      await expect(service.logout(token)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.logout(token)).rejects.toThrow('Failed to logout');
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
      };

      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        tokenType: 'refresh',
      };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.refresh('valid-refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-secret-key',
      });
      expect(mockTokenBlacklistService.blacklist).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockUser.email,
        false,
      );
      expect(result).toEqual({
        accessToken: `mock-token-${mockUser.id}`,
        refreshToken: `mock-token-${mockUser.id}`,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          name: mockUser.name,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        tokenType: 'refresh',
      };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.refresh('valid-refresh-token')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('expired-token')).rejects.toThrow(
        'Refresh token expired',
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException for other errors', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Some other error');
      });

      await expect(service.refresh('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('some-token')).rejects.toThrow(
        'Failed to refresh token',
      );
    });
  });

  describe('changePassword', () => {
    it('should successfully change password when current password matches', async () => {
      const mockUser = {
        id: 'user-123',
        password: '$2b$12$hashedcurrentpassword',
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCryptoProvider.compare.mockResolvedValue(true);
      mockCryptoProvider.encrypt.mockResolvedValue('$2b$12$newhashedpassword');
      mockUserRepository.updateProps.mockResolvedValue(undefined);

      const result = await service.changePassword('user-123', {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
      });

      expect(result.success).toBe(true);
      expect(mockCryptoProvider.compare).toHaveBeenCalledWith(
        'OldPassword123!',
        mockUser.password,
      );
      expect(mockCryptoProvider.encrypt).toHaveBeenCalledWith(
        'NewPassword456!',
      );
      expect(mockUserRepository.updateProps).toHaveBeenCalledWith(mockUser, {
        password: '$2b$12$newhashedpassword',
      });
    });

    it('should throw BadRequestException when current password does not match', async () => {
      const mockUser = {
        id: 'user-123',
        password: '$2b$12$hashedcurrentpassword',
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCryptoProvider.compare.mockResolvedValue(false);

      await expect(
        service.changePassword('user-123', {
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword456!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent-user', {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('password reset (JD-001)', () => {
    const resetUser = () =>
      new User(
        {
          id: 'user-reset',
          email: 'reset@example.com',
          username: 'resetter',
          name: 'Reset User',
        },
        'draft',
      );

    it('signs the reset token with tokenType password_reset', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(resetUser());

      await service.forgotPassword('reset@example.com');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-reset',
          email: 'reset@example.com',
          type: 'password_reset',
          tokenType: 'password_reset',
        }),
        { expiresIn: '1h' },
      );
    });

    it('blacklists the consumed reset token on resetPassword', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        sub: 'user-reset',
        email: 'reset@example.com',
        type: 'password_reset',
        tokenType: 'password_reset',
      });
      mockUserRepository.findById.mockResolvedValue(resetUser());
      mockCryptoProvider.encrypt.mockResolvedValue('$2b$12$newhashedpassword');
      mockUserRepository.updateProps.mockResolvedValue(undefined);

      const result = await service.resetPassword({
        token: 'reset-token-value',
        newPassword: 'NewPassword456!',
      });

      expect(result.success).toBe(true);
      expect(mockTokenBlacklistService.blacklist).toHaveBeenCalledWith(
        'reset-token-value',
      );
    });

    it('rejects replay of an already-consumed reset token (JD-001 round 2)', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        sub: 'user-reset',
        email: 'reset@example.com',
        type: 'password_reset',
        tokenType: 'password_reset',
      });
      mockUserRepository.findById.mockResolvedValue(resetUser());
      mockCryptoProvider.encrypt.mockResolvedValue('$2b$12$newhashedpassword');
      mockUserRepository.updateProps.mockResolvedValue(undefined);

      const first = await service.resetPassword({
        token: 'reset-token-value',
        newPassword: 'NewPassword456!',
      });
      expect(first.success).toBe(true);
      expect(mockTokenBlacklistService.blacklist).toHaveBeenCalledWith(
        'reset-token-value',
      );

      // The blacklist now reports the token as consumed.
      mockTokenBlacklistService.isBlacklisted.mockResolvedValue(true);

      await expect(
        service.resetPassword({
          token: 'reset-token-value',
          newPassword: 'AnotherPass789!',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUserRepository.updateProps).toHaveBeenCalledTimes(1);
    });

    it('rejects a token without the password_reset type', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        sub: 'user-reset',
        email: 'reset@example.com',
        tokenType: 'access',
      });
      mockUserRepository.findById.mockResolvedValue(resetUser());

      await expect(
        service.resetPassword({
          token: 'access-shaped-token',
          newPassword: 'NewPassword456!',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockTokenBlacklistService.blacklist).not.toHaveBeenCalled();
    });
  });
});
