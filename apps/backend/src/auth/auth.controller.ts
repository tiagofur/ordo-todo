import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CsrfService } from './csrf.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CheckUsernameDto } from './dto/check-username.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  GitHubOAuthPlatformGuard,
  GoogleOAuthPlatformGuard,
} from './guards/oauth-platform.guard';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
    private readonly configService: ConfigService,
  ) {}

  private extractRequestContext(
    req?: Request,
  ): { ip?: string; userAgent?: string } | undefined {
    if (!req) return undefined;
    const forwardedFor = req.headers?.['x-forwarded-for'];
    const ip =
      (Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor?.split(',')[0]?.trim()) ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';
    const userAgent =
      (typeof req.headers?.['user-agent'] === 'string'
        ? req.headers['user-agent']
        : undefined) || 'unknown';
    return { ip, userAgent };
  }

  /**
   * Public: which registration gate applies right now (ODD 019).
   * The signup form uses it to show/hide the invite-code field.
   */
  @Public()
  @Get('registration-mode')
  @ApiOperation({ summary: 'Get registration mode (invite-only | open)' })
  getRegistrationMode() {
    return {
      mode:
        this.configService.get<string>('REGISTRATION_MODE') ?? 'invite-only',
    };
  }

  /**
   * Register a new user account
   * Creates user, default workspace, and sets JWT tokens as httpOnly cookies
   */
  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 attempts/hour
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with default workspace and sets JWT access and refresh tokens as httpOnly cookies',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        user: {
          id: 'clx1234567890',
          email: 'user@example.com',
          username: 'johndoe',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (validation failed)',
  })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res?: Response,
    @Req() req?: Request,
  ) {
    const reqCtx = this.extractRequestContext(req);
    const { accessToken, refreshToken, user } = reqCtx
      ? await this.authService.register(registerDto, reqCtx)
      : await this.authService.register(registerDto);

    // Set httpOnly cookies for security (XSS protection)
    res?.cookie?.('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    res?.cookie?.('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { user, accessToken, refreshToken };
  }

  /**
   * Authenticate user and return JWT tokens
   * Validates credentials and returns access + refresh tokens as httpOnly cookies
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts/minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates user with email/password and sets JWT access and refresh tokens as httpOnly cookies',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 'clx1234567890',
          email: 'user@example.com',
          username: 'johndoe',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res?: Response,
    @Req() req?: Request,
  ) {
    const reqCtx = this.extractRequestContext(req);
    const { accessToken, refreshToken, user } = reqCtx
      ? await this.authService.login(loginDto, reqCtx)
      : await this.authService.login(loginDto);

    // Set httpOnly cookies for security (XSS protection)
    res?.cookie?.('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    res?.cookie?.('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { user, accessToken, refreshToken };
  }

  /**
   * Logout user and blacklist JWT token
   *
   * Adds the current access token to the blacklist to prevent reuse.
   * Clears httpOnly cookies.
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Blacklists the JWT access token, clears httpOnly cookies, and prevents further use.',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @CurrentUser() user: any,
    @Req() req?: Request,
    @Res({ passthrough: true }) res?: Response,
  ) {
    let token = req?.headers?.['authorization']?.replace('Bearer ', '');

    if (!token && req?.cookies && req?.cookies['access_token']) {
      token = req.cookies['access_token'];
    }

    if (token) {
      try {
        await this.authService.logout(token);
      } catch (err: any) {
        this.logger.warn(
          `Logout token blacklist skipped/failed: ${err?.message}`,
        );
      }
    }

    // Always clear httpOnly cookies regardless of token validity
    res?.clearCookie?.('access_token', { path: '/' });
    res?.clearCookie?.('refresh_token', { path: '/' });

    return { message: 'Logout successful' };
  }

  /**
   * Refresh JWT access token using refresh token
   * Implements token rotation for security
   * Refresh token is extracted from httpOnly cookie
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Refreshes JWT access token using a valid refresh token from httpOnly cookie. Implements token rotation for security.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        user: {
          id: 'clx1234567890',
          email: 'user@example.com',
          username: 'johndoe',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Body() refreshTokenDto?: RefreshTokenDto,
    @Req() req?: Request,
    @Res({ passthrough: true }) res?: Response,
  ) {
    // Extract refresh token from httpOnly cookie or request body (for mobile/API clients)
    const refreshToken =
      req?.cookies?.refresh_token || refreshTokenDto?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = await this.authService.refresh(refreshToken);

    // Set httpOnly cookies for new tokens
    res?.cookie?.('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    res?.cookie?.('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return { user, accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Check if a username is available for registration
   * Validates username format and uniqueness
   */
  @Public()
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 checks/hour
  @Post('check-username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check username availability',
    description:
      'Checks if a username is available for registration. Validates format and checks for duplicates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Username availability check result',
    schema: {
      example: {
        available: true,
        message: 'Username is available',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Username not available',
    schema: {
      example: { available: false, message: 'Username is already taken' },
    },
  })
  async checkUsername(@Body() checkUsernameDto: CheckUsernameDto) {
    return this.authService.checkUsernameAvailability(
      checkUsernameDto.username,
    );
  }

  /**
   * Get CSRF token for client-side forms
   *
   * Returns a random CSRF token that must be included in state-changing requests.
   * This prevents cross-site request forgery attacks.
   *
   * @see {@link https://owasp.org/www-community/attacks/csrf | OWASP CSRF Prevention}
   */
  @Public()
  @Get('csrf-token')
  @ApiOperation({
    summary: 'Get CSRF token',
    description:
      'Returns a CSRF token for client-side forms to prevent cross-site request forgery attacks.',
  })
  @ApiResponse({
    status: 200,
    description: 'CSRF token generated',
    schema: {
      example: {
        csrfToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      },
    },
  })
  getCsrfToken() {
    const csrfToken = this.csrfService.generateToken();
    return { csrfToken };
  }

  /**
   * Google OAuth login
   * Redirects to Google OAuth consent screen
   */
  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthPlatformGuard)
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Redirects to Google OAuth consent screen',
  })
  async googleAuth() {}

  /**
   * Google OAuth callback
   *
   * SECURITY: Uses httpOnly cookies instead of URL params/fragments for token storage.
   * This prevents XSS attacks from accessing tokens and ensures tokens aren't logged.
   *
   * @see {@link https://owasp.org/www-community/HttpOnly | OWASP HttpOnly}
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Handles OAuth callback from Google and sets JWT tokens via httpOnly cookies (secure)',
  })
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken, user } = req.user;

    // Check if this is a desktop OAuth flow
    const platform = req.query.state?.includes('desktop') ? 'desktop' : 'web';

    if (platform === 'desktop') {
      // For desktop, redirect to deep link with tokens
      const params = new URLSearchParams({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return res.redirect(`ordo://auth/callback?${params.toString()}`);
    }

    // SECURITY: Set tokens in httpOnly cookies (not accessible via JavaScript)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'lax' for OAuth redirects, 'strict' blocks cross-site redirects
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Redirect to dashboard (tokens are in cookies, not URL)
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3100'}/dashboard`,
    );
  }

  /**
   * GitHub OAuth login
   * Redirects to GitHub OAuth consent screen
   */
  @Public()
  @Get('github')
  @UseGuards(GitHubOAuthPlatformGuard)
  @ApiOperation({
    summary: 'GitHub OAuth login',
    description: 'Redirects to GitHub OAuth consent screen',
  })
  async githubAuth() {}

  /**
   * GitHub OAuth callback
   *
   * SECURITY: Uses httpOnly cookies instead of URL params/fragments for token storage.
   * This prevents XSS attacks from accessing tokens and ensures tokens aren't logged.
   *
   * @see {@link https://owasp.org/www-community/HttpOnly | OWASP HttpOnly}
   */
  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'GitHub OAuth callback',
    description:
      'Handles OAuth callback from GitHub and sets JWT tokens via httpOnly cookies (secure)',
  })
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken, user } = req.user;

    // Check if this is a desktop OAuth flow
    const platform = req.query.state?.includes('desktop') ? 'desktop' : 'web';

    if (platform === 'desktop') {
      // For desktop, redirect to deep link with tokens
      const params = new URLSearchParams({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return res.redirect(`ordo://auth/callback?${params.toString()}`);
    }

    // SECURITY: Set tokens in httpOnly cookies (not accessible via JavaScript)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 'lax' for OAuth redirects, 'strict' blocks cross-site redirects
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Redirect to dashboard (tokens are in cookies, not URL)
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3100'}/dashboard`,
    );
  }

  /**
   * Change user password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description: 'Updates the password of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid current or new password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  /**
   * Request password reset instructions
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 attempts/hour
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends password reset instructions to the provided email if the account exists',
  })
  @ApiResponse({
    status: 200,
    description:
      'Reset request processed (generic message to prevent enumeration)',
  })
  async forgotPassword(@Body('email') email: string) {
    this.logger.log(`Password reset requested for email: ${email}`);
    return this.authService.forgotPassword(email);
  }

  /**
   * Reset password with reset token
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 min
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password using a valid signed reset token',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
