import { Injectable, BadRequestException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, StrategyOptions, Profile } from 'passport-google-oauth20';
import { VerifyCallback } from 'passport-oauth2';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
      state: true, // ENABLE STATE PARAMETER FOR CSRF PROTECTION
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
    params: any, // OAuth params including state
  ) {
    try {
      // Validate state parameter to prevent CSRF attacks
      if (!params.state) {
        throw new BadRequestException(
          'Missing OAuth state parameter - possible CSRF attack',
        );
      }

      const { name, email, sub: googleId } = profile._json;

      const user = await this.authService.oauthLogin({
        provider: 'google',
        providerId: googleId,
        email: email ?? '',
        name: name ?? '',
        avatar: profile._json.picture,
      });

      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}
