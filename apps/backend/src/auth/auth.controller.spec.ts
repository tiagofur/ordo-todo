import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { CsrfService } from './csrf.service';

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
        {
          provide: CsrfService,
          useValue: {
            generateToken: jest.fn().mockReturnValue('mock-csrf-token'),
            validateToken: jest.fn().mockReturnValue(true),
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

      const result = await controller.logout(
        { id: 'user-123' } as any,
        mockRequest as any,
      );

      expect(result).toEqual({
        message: 'Logout successful',
      });
    });

    it('should handle logout without token', async () => {
      const mockRequest = {
        headers: {},
      };

      const result = await controller.logout(
        { id: 'user-123' } as any,
        mockRequest as any,
      );

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

    it('should try the body token when the cookie holds a stale one', async () => {
      const req = { cookies: { refresh_token: 'stale-cookie-token' } };
      const refreshTokenDto = { refreshToken: 'fresh-body-token' };

      (authService.refresh as jest.Mock).mockImplementation(
        async (token: string) => {
          if (token === 'stale-cookie-token') {
            throw new UnauthorizedException('Invalid or expired refresh token');
          }
          return {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            user: { id: 'user-1' },
          };
        },
      );

      const result = await controller.refresh(refreshTokenDto, req as any);

      expect(authService.refresh).toHaveBeenNthCalledWith(
        1,
        'fresh-body-token',
      );
      expect(authService.refresh).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: { id: 'user-1' },
      });
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

      expect(authService.checkUsernameAvailability).toHaveBeenCalledWith(
        'newuser',
      );
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

      expect(authService.checkUsernameAvailability).toHaveBeenCalledWith(
        'existinguser',
      );
      expect(result).toEqual({
        available: false,
        message: 'Username is already taken',
      });
    });
  });

  describe('GET /auth/google/callback', () => {
    const tokens = {
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      user: { id: 'user-1' },
    };

    const callbackReq = (state?: unknown) =>
      ({
        user: tokens,
        query: state === undefined ? {} : { state },
      }) as any;

    const callbackRes = () =>
      ({
        redirect: jest.fn(),
        cookie: jest.fn(),
      }) as any;

    it('redirects to the deep link for state=desktop', async () => {
      const res = callbackRes();
      await controller.googleAuthCallback(callbackReq('desktop'), res);
      expect(res.redirect).toHaveBeenCalledWith(
        'ordo://auth/callback?access_token=access-123&refresh_token=refresh-123',
      );
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('redirects to the deep link for state=mobile', async () => {
      const res = callbackRes();
      await controller.googleAuthCallback(callbackReq('mobile'), res);
      expect(res.redirect).toHaveBeenCalledWith(
        'ordo://auth/callback?access_token=access-123&refresh_token=refresh-123',
      );
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('sets cookies and redirects to web when state is missing or unknown', async () => {
      for (const state of [undefined, 'web', 'evil', ['desktop']]) {
        const res = callbackRes();
        await controller.googleAuthCallback(callbackReq(state), res);
        expect(res.cookie).toHaveBeenCalledTimes(2);
        expect(res.redirect).toHaveBeenCalledWith(
          expect.stringContaining('/dashboard'),
        );
      }
    });
  });

  describe('GET /auth/github/callback', () => {
    const tokens = {
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
      user: { id: 'user-1' },
    };

    it('redirects to the deep link for state=mobile', async () => {
      const res = { redirect: jest.fn(), cookie: jest.fn() } as any;
      await controller.githubAuthCallback(
        { user: tokens, query: { state: 'mobile' } } as any,
        res,
      );
      expect(res.redirect).toHaveBeenCalledWith(
        'ordo://auth/callback?access_token=access-123&refresh_token=refresh-123',
      );
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('sets cookies and redirects to web when state is missing', async () => {
      const res = { redirect: jest.fn(), cookie: jest.fn() } as any;
      await controller.githubAuthCallback(
        { user: tokens, query: {} } as any,
        res,
      );
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard'),
      );
    });
  });
});
