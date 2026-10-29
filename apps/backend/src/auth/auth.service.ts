import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  ConflictException,
  forwardRef,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  RegisterUser,
  UserLogin,
  type UserRepository,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  ConsumeInviteCodeUseCase,
  RecordInviteRedemptionUseCase,
  type InviteCodeRepository,
  type InviteCode,
  DomainError,
} from '@ordo-todo/core';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { TokenBlacklistService } from './token-blacklist.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { OAuthDto } from './dto/oauth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { EmailService } from '../email/email.service';
import { PlanLifecycleService } from '../billing/plan-lifecycle.service';
import type { StringValue } from 'ms';
import { AuthAuditService } from './auth-audit.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('InviteCodeRepository')
    private readonly inviteCodeRepository: InviteCodeRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WorkspacesService))
    private readonly workspacesService: WorkspacesService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly authAuditService: AuthAuditService,
    private readonly emailService: EmailService,
    private readonly planLifecycle: PlanLifecycleService,
  ) {}

  async register(
    registerDto: RegisterDto,
    requestContext?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    // ODD 019: in invite-only mode a valid InviteCode gates every new account.
    const consumedInvite = this.isRegistrationInviteOnly()
      ? await this.consumeInviteCode(registerDto.inviteCode)
      : null;

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

      // ODD 012 S5: trial de Pro sin tarjeta para toda cuenta nueva. Un
      // fallo aquí no puede bloquear el registro.
      try {
        const created = await this.userRepository.findByEmail(
          registerDto.email,
          false,
        );
        if (created) {
          await this.planLifecycle.startTrialForNewUser(created.id);
        }
      } catch (error) {
        this.logger.warn(
          `No se pudo iniciar el trial para ${registerDto.email}: ${(error as Error).message}`,
        );
      }

      if (consumedInvite) {
        const created = await this.userRepository.findByEmail(
          registerDto.email,
          false,
        );
        if (created) {
          await new RecordInviteRedemptionUseCase(
            this.inviteCodeRepository,
          ).execute({
            inviteCodeId: consumedInvite.id,
            userId: created.id,
          });
        } else {
          this.logger.warn(
            `Invite ${consumedInvite.code} consumed but user ${registerDto.email} not found right after registration`,
          );
        }
      }
    } catch (error) {
      // Refund the consumed use: a failed registration must not burn it.
      if (consumedInvite) {
        await this.inviteCodeRepository.release(consumedInvite.id);
      }
      if (
        error instanceof UserAlreadyExistsError ||
        error.message?.includes('já existe') ||
        error.message?.includes('já está em uso') ||
        error.message?.includes('already exists')
      ) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    // Dispatch welcome email asynchronously without blocking registration
    this.emailService
      .sendWelcome({
        to: registerDto.email,
        userName: registerDto.name || registerDto.username,
      })
      .catch((err) =>
        this.logger.warn(`Failed to dispatch welcome email: ${err.message}`),
      );

    // After registration, log the user in
    return this.login(
      {
        email: registerDto.email,
        password: registerDto.password,
      },
      requestContext,
    );
  }

  // ODD 019: registration gate. Invite-only by default; REGISTRATION_MODE=open
  // reopens public registration without a deploy.
  private isRegistrationInviteOnly(): boolean {
    return (
      (this.configService.get<string>('REGISTRATION_MODE') ?? 'invite-only') !==
      'open'
    );
  }

  /**
   * Validates and consumes one use of an invite code. Domain errors become
   * machine-readable HTTP responses so the frontend can show precise messages
   * (INVITE_INVALID / INVITE_INACTIVE / INVITE_EXHAUSTED → 400,
   * INVITE_EXPIRED → 410).
   */
  private async consumeInviteCode(rawCode?: string): Promise<InviteCode> {
    if (!rawCode || !rawCode.trim()) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'INVITE_INVALID',
          message: 'An invitation code is required to register',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await new ConsumeInviteCodeUseCase(
        this.inviteCodeRepository,
      ).execute({
        code: rawCode,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        const status =
          error.code === 'INVITE_EXPIRED'
            ? HttpStatus.GONE
            : HttpStatus.BAD_REQUEST;
        throw new HttpException(
          { statusCode: status, code: error.code, message: error.message },
          status,
        );
      }
      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
    requestContext?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    try {
      const identifier = loginDto.email.trim();
      const user = identifier.includes('@')
        ? await this.userRepository.findByEmail(identifier, true)
        : await this.userRepository.findByUsername(
            identifier.toLowerCase(),
            true,
          );
      const clientIp = this.getRequestIp(requestContext);
      const clientUserAgent = this.getRequestUserAgent(requestContext);

      if (!user) {
        await this.authAuditService.loginFailed(
          loginDto.email,
          clientIp,
          clientUserAgent,
          'User not found',
        );

        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user has a password (OAuth users may not have one)
      if (!user.password) {
        await this.authAuditService.loginFailed(
          loginDto.email,
          clientIp,
          clientUserAgent,
          'No password set (OAuth user)',
        );

        throw new UnauthorizedException('Invalid credentials');
      }

      const isValid = await this.cryptoProvider.compare(
        loginDto.password,
        user.password,
      );

      if (!isValid) {
        await this.authAuditService.loginFailed(
          loginDto.email,
          clientIp,
          clientUserAgent,
          'Invalid password',
        );

        throw new UnauthorizedException('Invalid credentials');
      }

      // ODD 019 (A3): a BLOCKED account cannot authenticate, even with valid
      // credentials. Machine-readable code for the frontend.
      if (user.status === 'BLOCKED') {
        await this.authAuditService.loginFailed(
          loginDto.email,
          clientIp,
          clientUserAgent,
          'Account blocked',
        );

        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            code: 'ACCOUNT_BLOCKED',
            message: 'This account has been blocked',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const basePayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      };

      const accessToken = this.jwtService.sign({
        ...basePayload,
        tokenType: 'access',
        jti: crypto.randomUUID(),
      });

      const refreshToken = this.jwtService.sign(
        {
          ...basePayload,
          tokenType: 'refresh',
          jti: crypto.randomUUID(),
        },
        {
          expiresIn: (this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION',
          ) ?? '7d') as StringValue,
        },
      );

      await this.authAuditService.loginSuccess(
        user.id,
        user.email,
        clientIp,
        clientUserAgent,
      );

      // ODD 019: last successful login feeds the admin user table.
      await this.userRepository.updateProps(user, { lastLoginAt: new Date() });

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
      if (
        error instanceof InvalidCredentialsError ||
        error.message?.includes('não encontrado') ||
        error.message?.includes('incorreta') ||
        error.message?.includes('Invalid credentials')
      ) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  async validateUser(email: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email, false);
    // ODD 019 (A3): BLOCKED users fail every authenticated request here, which
    // is what kills their already-issued tokens the moment they are blocked.
    if (!user || user.status === 'BLOCKED') {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };
  }

  // ODD 024: los tokens OAuth de clientes first-party llegan sin email (el
  // payload solo lleva sub) — se resuelve el usuario por id, mismo patrón y
  // mismo check de BLOCKED que validateUser y oauth.guard.
  async validateUserById(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId, false);
    if (!user || user.status === 'BLOCKED') {
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
      // Check if refresh token is already revoked/blacklisted
      if (await this.tokenBlacklistService.isBlacklisted(refreshToken)) {
        throw new UnauthorizedException(
          'Refresh token has been revoked or reused',
        );
      }

      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET')!,
      });

      // Verify token type to prevent using access tokens as refresh tokens
      if (payload.tokenType && payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type for refresh');
      }
      // Validate that the user still exists
      const user = await this.validateUser(payload.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Invalidate the consumed refresh token (single-use refresh token rotation)
      await this.tokenBlacklistService.blacklist(refreshToken);

      // Generate new tokens (token rotation for security)
      const basePayload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      };

      const accessToken = this.jwtService.sign({
        ...basePayload,
        tokenType: 'access',
        jti: crypto.randomUUID(),
      });

      const newRefreshToken = this.jwtService.sign(
        {
          ...basePayload,
          tokenType: 'refresh',
          jti: crypto.randomUUID(),
        },
        {
          expiresIn: (this.configService.get<string>(
            'JWT_REFRESH_EXPIRATION',
          ) ?? '7d') as StringValue,
        },
      );

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
        if (this.isRegistrationInviteOnly()) {
          // ODD 019 (A1): no new account without an invite code, social included.
          throw new HttpException(
            {
              statusCode: HttpStatus.FORBIDDEN,
              code: 'REGISTRATION_INVITE_ONLY',
              message: 'New account registration requires an invitation code',
            },
            HttpStatus.FORBIDDEN,
          );
        }
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

        // ODD 012 S5: trial de Pro sin tarjeta también para cuentas OAuth.
        try {
          await this.planLifecycle.startTrialForNewUser(user.id);
        } catch (error) {
          this.logger.warn(
            `No se pudo iniciar el trial para ${email}: ${(error as Error).message}`,
          );
        }

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

    // ODD 019 (A3): never issue fresh tokens to a blocked account.
    if (user.status === 'BLOCKED') {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          code: 'ACCOUNT_BLOCKED',
          message: 'This account has been blocked',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate JWT tokens
    const basePayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };

    const accessToken = this.jwtService.sign({
      ...basePayload,
      tokenType: 'access',
      jti: crypto.randomUUID(),
    });
    const refreshToken = this.jwtService.sign(
      {
        ...basePayload,
        tokenType: 'refresh',
        jti: crypto.randomUUID(),
      },
      {
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ??
          '7d') as StringValue,
      },
    );

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

  private getRequestIp(requestContext?: {
    ip?: string;
    userAgent?: string;
  }): string {
    return requestContext?.ip || 'unknown';
  }

  private getRequestUserAgent(requestContext?: {
    ip?: string;
    userAgent?: string;
  }): string {
    return requestContext?.userAgent || 'unknown';
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

  /**
   * Change user password securely
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(userId, true);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.password) {
      const isValid = await this.cryptoProvider.compare(
        changePasswordDto.currentPassword,
        user.password,
      );
      if (!isValid) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    const hashedPassword = await this.cryptoProvider.encrypt(
      changePasswordDto.newPassword,
    );

    await this.userRepository.updateProps(user, {
      password: hashedPassword,
    });

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  /**
   * Request password reset instructions
   * Sends an email with a signed 1-hour JWT token if the user exists
   */
  async forgotPassword(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (user) {
        const resetToken = this.jwtService.sign(
          {
            sub: user.id,
            email: user.props.email,
            type: 'password_reset',
          },
          {
            expiresIn: '1h',
          },
        );

        await this.emailService.sendPasswordReset({
          to: user.props.email || email,
          userName: user.props.name || user.props.username,
          resetToken,
        });

        this.logger.log(`Password reset email dispatched for ${email}`);
      } else {
        this.logger.warn(
          `Password reset requested for non-existent email: ${email}`,
        );
      }

      // Always return identical message to prevent account enumeration
      return {
        success: true,
        message:
          'If an account with that email exists, password reset instructions have been sent.',
      };
    } catch (error: any) {
      this.logger.error(
        `Error processing password reset request: ${error.message}`,
        error.stack,
      );
      return {
        success: true,
        message:
          'If an account with that email exists, password reset instructions have been sent.',
      };
    }
  }

  /**
   * Reset password using a valid reset token
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);

      if (payload.type !== 'password_reset' || !payload.sub) {
        throw new BadRequestException('Invalid password reset token');
      }

      const user = await this.userRepository.findById(payload.sub, true);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const hashedPassword = await this.cryptoProvider.encrypt(
        resetPasswordDto.newPassword,
      );

      await this.userRepository.updateProps(user, {
        password: hashedPassword,
      });

      this.logger.log(
        `Password reset successfully completed for user: ${user.id}`,
      );

      return {
        success: true,
        message: 'Password has been reset successfully. You can now log in.',
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Password reset link has expired. Please request a new one.',
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid password reset token.');
      }
      this.logger.error(`Reset password failed: ${error.message}`, error.stack);
      throw new BadRequestException(
        'Failed to reset password. Please try again.',
      );
    }
  }
}
