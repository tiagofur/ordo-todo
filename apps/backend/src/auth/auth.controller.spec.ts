import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePass123!',
        name: 'New User',
      };

      jest.spyOn(authService, 'register').mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'newuser@example.com',
          username: 'newuser',
          name: 'New User',
        },
      } as any);

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

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new BadRequestException('Email already exists'));

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

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new BadRequestException('Username already exists'));

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

      jest.spyOn(authService, 'login').mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
        },
      } as any);

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

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success message on logout', async () => {
      const result = await controller.logout();

      expect(result).toEqual({
        message: 'Logout successful',
      });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      jest.spyOn(authService, 'refresh').mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      } as any);

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refresh).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      jest
        .spyOn(authService, 'refresh')
        .mockRejectedValue(
          new UnauthorizedException('Invalid or expired refresh token'),
        );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/check-username', () => {
    it('should return true when username is available', async () => {
      const body = { username: 'newuser' };

      jest.spyOn(authService, 'checkUsernameAvailability').mockResolvedValue(true);

      const result = await controller.checkUsername(body);

      expect(authService.checkUsernameAvailability).toHaveBeenCalledWith('newuser');
      expect(result).toBe(true);
    });

    it('should return false when username is taken', async () => {
      const body = { username: 'existinguser' };

      jest.spyOn(authService, 'checkUsernameAvailability').mockResolvedValue(false);

      const result = await controller.checkUsername(body);

      expect(authService.checkUsernameAvailability).toHaveBeenCalledWith('existinguser');
      expect(result).toBe(false);
    });
  });

    it('should return false when username is taken', async () => {
      const body = { username: 'existinguser' };

      jest
        .spyOn(authService, 'checkUsernameAvailability')
        .mockResolvedValue(false);

      const result = await controller.checkUsername(body);

      expect(authService.checkUsernameAvailability).toHaveBeenCalledWith(
        'existinguser',
      );
      expect(result).toBe(false);
    });
  });
});

