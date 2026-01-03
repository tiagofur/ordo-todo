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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account
   * Creates user, default workspace, and returns auth tokens
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with default workspace and returns JWT access token',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Authenticate user and return JWT tokens
   * Validates credentials and returns access + refresh tokens
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates user with email/password and returns JWT access and refresh tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Logout user and blacklist JWT token
   *
   * Adds the current access token to the blacklist to prevent reuse.
   * Clients should also remove the token from local storage.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Blacklists the JWT access token and prevents further use. Clients should also remove tokens from local storage.',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (token) {
      await this.authService.logout(token);
    }

    return { message: 'Logout successful' };
  }

  /**
   * Refresh JWT access token using refresh token
   * Implements token rotation for security
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Refreshes JWT access token using a valid refresh token. Implements token rotation for security.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  /**
   * Check if a username is available for registration
   * Validates username format and uniqueness
   */
  @Public()
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
  async checkUsername(@Body() body: { username: string }) {
    return this.authService.checkUsernameAvailability(body.username);
  }

  /**
   * Google OAuth login
   * Redirects to Google OAuth consent screen
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Redirects to Google OAuth consent screen',
  })
  async googleAuth() {}

  /**
   * Google OAuth callback
   * Handles OAuth callback from Google
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles OAuth callback from Google and returns JWT tokens',
  })
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken, user } = req.user;

    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?` +
        `access_token=${accessToken}&` +
        `refresh_token=${refreshToken}&` +
        `user_id=${user.id}`,
    );
  }

  /**
   * GitHub OAuth login
   * Redirects to GitHub OAuth consent screen
   */
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'GitHub OAuth login',
    description: 'Redirects to GitHub OAuth consent screen',
  })
  async githubAuth() {}

  /**
   * GitHub OAuth callback
   * Handles OAuth callback from GitHub
   */
  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({
    summary: 'GitHub OAuth callback',
    description: 'Handles OAuth callback from GitHub and returns JWT tokens',
  })
  async githubAuthCallback(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken, user } = req.user;

    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?` +
        `access_token=${accessToken}&` +
        `refresh_token=${refreshToken}&` +
        `user_id=${user.id}`,
    );
  }
}
