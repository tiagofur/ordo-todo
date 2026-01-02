import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, StrategyOptions, Profile } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || '',
      scope: ['user:email'],
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const { id: githubId, username } = profile;
      const email = profile.emails?.[0]?.value;
      const displayName = profile.displayName || username || '';

      const user = await this.authService.oauthLogin({
        provider: 'github',
        providerId: String(githubId),
        email: email || '',
        name: displayName,
        avatar: profile.photos?.[0]?.value,
      });

      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}
