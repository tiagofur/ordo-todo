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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Get the token from the request to check if it's blacklisted
    const token = req.get('authorization')?.replace('Bearer ', '');

    if (token && await this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const user = await this.authService.validateUser(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
