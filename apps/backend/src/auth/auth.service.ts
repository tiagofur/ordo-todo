import {
  Injectable,
  UnauthorizedException,
  Inject,
  ConflictException,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUser, UserLogin, type UserRepository } from '@ordo-todo/core';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { TokenBlacklistService } from './token-blacklist.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { OAuthDto } from './dto/oauth.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { StringValue } from 'ms';
import { AuthAuditService } from './auth-audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspacesService: WorkspacesService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly authAuditService: AuthAuditService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const registerUseCase = new RegisterUser(
        this.userRepository,
        this.cryptoProvider,
      );

      await registerUseCase.execute({
        name: registerDto.name,
        username: registerDto.username,
        email: registerDto.email,
        password: registerDto.password,
      });

      // After registration, log the user in
      return this.login({
        email: registerDto.email,
        password: registerDto.password,
      });
    } catch (error) {
      if (
        error.message.includes('já existe') ||
        error.message.includes('já está em uso')
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.userRepository.findByEmail(loginDto.email);

      if (!user) {
        await this.authAuditService.loginFailed(
          loginDto.email,
          this.getRequestIp(),
          this.getRequestUserAgent(),
          'User not found',
        );

        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user has a password (OAuth users may not have one)
      if (!user.password) {
        await this.authAuditService.loginFailed(
          loginDto.email,
          this.getRequestIp(),
          this.getRequestUserAgent(),
          'No password set (OAuth user)',
        );

        throw new UnauthorizedException('Invalid email or password');
      }

      const isValid = await this.cryptoProvider.compare(
        loginDto.password,
        user.password,
      );

      if (!isValid) {
        await this.authAuditService.loginFailed(
          loginDto.email,
          this.getRequestIp(),
          this.getRequestUserAgent(),
          'Invalid password',
        );

        throw new UnauthorizedException('Invalid email or password');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ??
          '7d') as StringValue,
      });

      await this.authAuditService.loginSuccess(
        user.id,
        user.email,
        this.getRequestIp(),
        this.getRequestUserAgent(),
      );

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  async validateUser(email: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email, false);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET')!,
      });

      // Check if refresh token is already blacklisted (token reuse detection)
      if (await this.tokenBlacklistService.isBlacklisted(refreshToken)) {
        throw new UnauthorizedException(
          'Refresh token has been revoked or reused',
        );
      }

      // Blacklist the refresh token BEFORE generating a new one (token rotation)
      await this.tokenBlacklistService.blacklist(refreshToken);

      // Validate that the user still exists
      const user = await this.validateUser(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens (token rotation for security)
      const newPayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ??
          '7d') as StringValue,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);

      // Re-throw if it's already an UnauthorizedException
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  /**
   * Check if a username is available
   */
  async checkUsernameAvailability(
    username: string,
  ): Promise<{ available: boolean; message?: string }> {
    // Validate username format
    const usernameRegex = /^[a-z0-9_-]+$/;

    if (!username || username.length < 3) {
      return {
        available: false,
        message: 'Username must be at least 3 characters',
      };
    }

    if (username.length > 20) {
      return {
        available: false,
        message: 'Username must be less than 20 characters',
      };
    }

    if (!usernameRegex.test(username)) {
      return {
        available: false,
        message:
          'Username can only contain lowercase letters, numbers, hyphens, and underscores',
      };
    }

    if (username.startsWith('_') || username.startsWith('-')) {
      return {
        available: false,
        message: 'Username cannot start with underscore or hyphen',
      };
    }

    if (username.endsWith('_') || username.endsWith('-')) {
      return {
        available: false,
        message: 'Username cannot end with underscore or hyphen',
      };
    }

    if (username.includes('--') || username.includes('__')) {
      return {
        available: false,
        message: 'Username cannot contain consecutive hyphens or underscores',
      };
    }

    // Check if username is already taken
    const existingUser = await this.userRepository.findByUsername(username);

    if (existingUser) {
      return { available: false, message: 'Username is already taken' };
    }

    return { available: true, message: 'Username is available' };
  }

  /**
   * OAuth login handler
   * Creates or finds user by OAuth provider and returns tokens
   */
  async oauthLogin(oauthDto: OAuthDto): Promise<AuthResponseDto> {
    const { provider, providerId, email, name, avatar } = oauthDto;

    // Try to find user by OAuth provider and providerId
    let user = await this.userRepository.findByProvider(provider, providerId);

    if (!user) {
      // Check if user exists by email
      const existingUser = await this.userRepository.findByEmail(email, false);

      if (existingUser) {
        // Link OAuth account to existing user
        user = await this.userRepository.linkOAuthAccount(
          existingUser.id,
          provider,
          providerId,
        );
      } else {
        // Create new user with OAuth
        // Generate a random username based on email
        const baseUsername = email.split('@')[0].replace(/[^a-z0-9]/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const username = `${baseUsername}${randomSuffix}`;

        // Create user without password (OAuth users don't need password)
        user = await this.userRepository.create({
          name,
          email,
          username,
          image: avatar, // OAuth avatar maps to image field
          provider,
          providerId,
        });

        // Create default workspace for new user
        try {
          await this.workspacesService.create(
            {
              name: 'My Workspace',
              slug: 'my-workspace',
              description: 'Your personal workspace',
              color: '#2563EB',
              icon: '🏠',
            },
            user.id,
          );
        } catch (error) {
          console.error(
            'Failed to create default workspace for OAuth user:',
            error,
          );
        }
      }
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ??
        '7d') as StringValue,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email || '',
        username: user.username,
        name: user.name || '',
      },
    };
  }

  private getRequestIp(): string {
    return 'unknown'; // TODO: Get real IP from request
  }

  private getRequestUserAgent(): string {
    return 'unknown'; // TODO: Get real user agent from request headers
  }

  /**
   * Logout user and blacklist their access token
   *
   * @param accessToken - JWT access token to revoke
   * @returns Promise that resolves when logout is complete
   */
  async logout(accessToken: string): Promise<void> {
    try {
      // Add token to blacklist to prevent reuse
      await this.tokenBlacklistService.blacklist(accessToken);
    } catch (error) {
      this.logger.error('Failed to logout user', error);
      throw new UnauthorizedException('Failed to logout');
    }
  }
}
