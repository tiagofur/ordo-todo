import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    // Create a mock user repository
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByProvider: jest.fn(),
      create: jest.fn(),
      linkOAuthAccount: jest.fn(),
      update: jest.fn(),
    };

    // Create a mock crypto provider
    const mockCryptoProvider = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: () => ({
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refresh: jest.fn(),
            checkUsernameAvailability: jest.fn(),
            validateUser: jest.fn(),
            oauthLogin: jest.fn(),
          }),
        },
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
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: WorkspacesService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            blacklist: jest.fn(),
            isBlacklisted: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePass123!',
        name: 'New User',
      };

      (authService.register as jest.Mock).mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'newuser@example.com',
          username: 'newuser',
          name: 'New User',
        },
      });

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'newuser@example.com',
          username: 'newuser',
          name: 'New User',
        },
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        username: 'newuser',
        password: 'SecurePass123!',
        name: 'New User',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when username already exists', async () => {
      const registerDto = {
        email: 'new@example.com',
        username: 'existing',
        password: 'SecurePass123!',
        name: 'New User',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestException('Username already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
        },
      });

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
        },
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success message on logout', async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const mockRequest = {
        headers: {
          authorization: 'Bearer test-token',
        },
      };

      const result = await controller.logout({ id: 'user-123' } as any, mockRequest as any);

      expect(result).toEqual({
        message: 'Logout successful',
      });
    });

    it('should handle logout without token', async () => {
      const mockRequest = {
        headers: {},
      };

      const result = await controller.logout({ id: 'user-123' } as any, mockRequest as any);

      expect(result).toEqual({
        message: 'Logout successful',
      });
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      (authService.refresh as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refresh).toHaveBeenCalledWith('valid-refresh-token');
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      (authService.refresh as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/check-username', () => {
    it('should return availability object when username is available', async () => {
      const body = { username: 'newuser' };

      (authService.checkUsernameAvailability as jest.Mock).mockResolvedValue({
        available: true,
        message: 'Username is available',
      });

      const result = await controller.checkUsername(body);

      expect(authService.checkUsernameAvailability).toHaveBeenCalledWith('newuser');
      expect(result).toEqual({
        available: true,
        message: 'Username is available',
      });
    });

    it('should return availability object when username is taken', async () => {
      const body = { username: 'existinguser' };

      (authService.checkUsernameAvailability as jest.Mock).mockResolvedValue({
        available: false,
        message: 'Username is already taken',
      });

      const result = await controller.checkUsername(body);

      expect(authService.checkUsernameAvailability).toHaveBeenCalledWith('existinguser');
      expect(result).toEqual({
        available: false,
        message: 'Username is already taken',
      });
    });
  });
});
