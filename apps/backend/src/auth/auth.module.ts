import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { RepositoriesModule } from '../repositories/repositories.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    PassportModule,
    RepositoriesModule,
    WorkspacesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRATION') ??
            '1d') as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    GitHubStrategy,
    BcryptCryptoProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
