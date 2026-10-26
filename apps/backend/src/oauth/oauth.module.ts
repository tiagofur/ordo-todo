import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AuthAuditService } from '../auth/auth-audit.service';
import { OAuthController } from './oauth.controller';
import { OAuthWellKnownController } from './oauth-well-known.controller';
import { OAuthService } from './oauth.service';
import { OAuthGuard } from './oauth.guard';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [OAuthController, OAuthWellKnownController],
  providers: [OAuthService, OAuthGuard, AuthAuditService],
  exports: [OAuthService, OAuthGuard],
})
export class OAuthModule {}
