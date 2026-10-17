import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@ordo-todo/core';
import { AuthService } from './auth.service';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { TokenBlacklistService } from './token-blacklist.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthAuditService } from './auth-audit.service';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    updateProps: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockCryptoProvider = {
    encrypt: jest.fn(),
    compare: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
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
            sendWorkspaceInvitation: jest.fn().mockResolvedValue({ success: true }),
            sendPasswordReset: jest.fn().mockResolvedValue({ success: true }),
            sendWelcome: jest.fn().mockResolvedValue({ success: true }),
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
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCreatedUser);
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
      expect(mockCryptoProvider.encrypt).toHaveBeenCalledWith('NewPassword456!');
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
});
