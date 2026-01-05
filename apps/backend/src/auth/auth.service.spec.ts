import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { TokenBlacklistService } from './token-blacklist.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let tokenBlacklistService: TokenBlacklistService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockCryptoProvider = {
    hash: jest.fn(),
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
    createPersonalWorkspace: jest.fn(),
  };

  const mockTokenBlacklistService = {
    blacklist: jest.fn(),
    isBlacklisted: jest.fn(),
  };

  beforeEach(async () => {
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
            sign: jest.fn((payload) => `mock-token-${payload.sub}`),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'WorkspacesService',
          useValue: mockWorkspacesService,
        },
        {
          provide: TokenBlacklistService,
          useValue: mockTokenBlacklistService,
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
    const registerDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockCryptoProvider.hash.mockResolvedValue('hashed-password');

      const mockCreatedUser = {
        id: 'user-123',
        email: registerDto.email,
        username: registerDto.username,
        name: registerDto.name,
      };
      mockUserRepository.create.mockResolvedValue(mockCreatedUser as any);
      mockWorkspacesService.createPersonalWorkspace.mockResolvedValue({
        id: 'ws-1',
      } as any);

      const result = await service.register(registerDto as any);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockCryptoProvider.hash).toHaveBeenCalledWith(
        registerDto.password,
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(
        mockWorkspacesService.createPersonalWorkspace,
      ).toHaveBeenCalledWith(mockCreatedUser.id);
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
      const existingUser = {
        id: 'existing-user',
        email: registerDto.email,
      };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser as any);

      await expect(service.register(registerDto as any)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto as any)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginDto.email,
        password: 'hashed-password',
        username: 'testuser',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockCryptoProvider.compare.mockResolvedValue(true);
      mockWorkspacesService.createPersonalWorkspace.mockResolvedValue({
        id: 'ws-1',
      } as any);

      const result = await service.login(loginDto as any);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginDto.email,
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

      await expect(service.login(loginDto as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto as any)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginDto.email,
        password: 'hashed-password',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser as any);
      mockCryptoProvider.compare.mockResolvedValue(false);

      await expect(service.login(loginDto as any)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto as any)).rejects.toThrow(
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
        name: 'Test User',
      };

      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      };

      // Mock JWT verification
      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);

      // Mock user repository
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.refresh('valid-refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-secret-key',
      });
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
          name: mockUser.name,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
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
});
