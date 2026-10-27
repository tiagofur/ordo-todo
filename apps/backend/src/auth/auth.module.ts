import { Module, BadRequestException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthSecurityController } from './auth-security.controller';
import { SessionsController } from './sessions.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';
import { BcryptCryptoProvider } from './crypto/bcrypt-crypto.provider';
import { TokenBlacklistService } from './token-blacklist.service';
import { CsrfService } from './csrf.service';
import { JwtSecretRotationService } from './jwt-rotation.service';
import { AuthAuditService } from './auth-audit.service';
import { SessionsService } from './sessions.service';
import { PkceService } from './pkce.service';
import { BillingModule } from '../billing/billing.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import type { StringValue } from 'ms';

@Module({
  imports: [
    BillingModule,
    PassportModule,
    RepositoriesModule,
    WorkspacesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        // Validate that JWT secret is at least 32 characters (256 bits)
        if (!jwtSecret || jwtSecret.length < 32) {
          throw new BadRequestException(
            'JWT_SECRET must be at least 32 characters long (256 bits) for secure JWT signing',
          );
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRATION') ??
              '1d') as StringValue,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, AuthSecurityController, SessionsController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    GitHubStrategy,
    BcryptCryptoProvider,
    TokenBlacklistService,
    CsrfService,
    JwtSecretRotationService,
    AuthAuditService,
    SessionsService,
    PkceService,
  ],
  exports: [AuthService, SessionsService, PkceService],
})
export class AuthModule {}
