import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';

interface OAuthAccessPayload {
  sub: string;
  client_id: string;
  scope: string;
  tokenType?: string;
}

/**
 * Authenticates requests carrying an OAuth access token issued by
 * {@link OAuthService}. Resolves the user from the token subject and
 * exposes client and scope metadata on `request.oauth`.
 */
@Injectable()
export class OAuthGuard implements CanActivate {
  private readonly logger = new Logger(OAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined =
      request.get?.('authorization') ?? request.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let payload: OAuthAccessPayload;
    try {
      payload = await this.jwtService.verifyAsync<OAuthAccessPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (payload.tokenType !== 'oauth_access' || !payload.sub) {
      throw new UnauthorizedException('Not an OAuth access token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        status: true,
      },
    });
    if (!user) {
      this.logger.warn(
        `OAuth token for missing user ${payload.sub} (client ${payload.client_id})`,
      );
      throw new UnauthorizedException('Token owner not found');
    }
    // ODD 019 (A3): a BLOCKED owner loses MCP/public-API access immediately.
    if (user.status === 'BLOCKED') {
      this.logger.warn(
        `OAuth token for blocked user ${payload.sub} (client ${payload.client_id})`,
      );
      throw new UnauthorizedException('Account blocked');
    }

    request.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };
    request.oauth = {
      clientId: payload.client_id,
      scopes: payload.scope ? payload.scope.split(' ').filter(Boolean) : [],
    };

    return true;
  }
}
