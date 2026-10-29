import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          if (req && req.cookies) {
            return req.cookies['access_token'];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Get the token from the request to check if it's blacklisted
    let token = req.get('authorization')?.replace('Bearer ', '');

    if (!token && req.cookies && req.cookies['access_token']) {
      token = req.cookies['access_token'];
    }

    if (token && (await this.tokenBlacklistService.isBlacklisted(token))) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // ODD 024: los tokens OAuth de clientes first-party (allowlist en env,
    // claim `api: 'full'`) autentican la API completa; los de clientes de
    // terceros siguen limitados a MCP (oauth.guard).
    if (payload.tokenType === 'oauth_access') {
      if (payload.api !== 'full') {
        throw new UnauthorizedException(
          'OAuth token not allowed on the regular API',
        );
      }
      const user = await this.authService.validateUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    }

    if (payload.tokenType && payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.authService.validateUser(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
