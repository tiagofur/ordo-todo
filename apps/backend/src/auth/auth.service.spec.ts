import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';

describe('AuthService - Refresh Token', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
