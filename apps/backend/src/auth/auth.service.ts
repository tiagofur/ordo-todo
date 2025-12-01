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
        email: registerDto.email,
        password: registerDto.password,
      });

      // After registration, log the user in
      return this.login({
        email: registerDto.email,
        password: registerDto.password,
      });
    } catch (error) {
      if (error.message.includes('já existe')) {
        throw new ConflictException('User already exists');
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
      name: user.name,
    };
  }
}
