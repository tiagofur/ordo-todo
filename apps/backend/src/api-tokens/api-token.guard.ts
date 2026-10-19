import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiTokensService } from './api-tokens.service';
import { API_TOKEN_PREFIX } from './api-token.constants';

/**
 * Authenticates requests carrying a personal access token
 * (`Authorization: Bearer ordo_pat_...`). Resolves the user from the token
 * owner and exposes token metadata on `request.apiToken`.
 */
@Injectable()
export class ApiTokenGuard implements CanActivate {
  private readonly logger = new Logger(ApiTokenGuard.name);

  constructor(
    private readonly apiTokensService: ApiTokensService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined =
      request.get?.('authorization') ?? request.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token || !token.startsWith(API_TOKEN_PREFIX)) {
      throw new UnauthorizedException('Missing or invalid API token');
    }

    const validated = await this.apiTokensService.validateToken(token);
    if (!validated) {
      throw new UnauthorizedException('Invalid or revoked API token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: validated.userId },
      select: { id: true, email: true, username: true, name: true },
    });
    if (!user) {
      this.logger.warn(
        `API token ${validated.tokenId} has no owner (user ${validated.userId})`,
      );
      throw new UnauthorizedException('Token owner not found');
    }

    request.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    };
    request.apiToken = { id: validated.tokenId, scopes: validated.scopes };

    return true;
  }
}
