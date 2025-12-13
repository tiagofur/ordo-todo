import {
  Injectable,
  UnauthorizedException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterUser, UserLogin, type UserRepository } from '@ordo-todo/core';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const registerUseCase = new RegisterUser(
        this.userRepository,
        this.cryptoProvider,
      );

      await registerUseCase.execute({
        name: registerDto.name || '',
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
      if (error.message.includes('já existe') || error.message.includes('já está em uso')) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const loginUseCase = new UserLogin(
        this.userRepository,
        this.cryptoProvider,
      );

      const user = await loginUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
      });

      const payload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
        )! as any,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name || null,
        },
      };
    } catch (error) {
      if (
        error.message.includes('não encontrado') ||
        error.message.includes('incorreta')
      ) {
        throw new UnauthorizedException('Invalid credentials');
      }
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
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
        )! as any,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name || null,
        },
      };
    } catch (error) {
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
}
