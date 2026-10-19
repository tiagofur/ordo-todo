import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTokenGuard } from '../api-tokens/api-token.guard';

/**
 * Authentication for the public `/v1` API surface.
 *
 * Accepts personal access tokens (`ordo_pat_...`) and delegates to
 * {@link ApiTokenGuard}, the single implementation of PAT validation.
 * OAuth access tokens are a future extension point (T-follow-up):
 * non-PAT bearer tokens are rejected here today.
 */
@Injectable()
export class PublicApiGuard implements CanActivate {
  constructor(private readonly apiTokenGuard: ApiTokenGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined =
      request.get?.('authorization') ?? request.headers?.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    if (!token.startsWith('ordo_pat_')) {
      throw new UnauthorizedException(
        'Only personal access tokens are accepted on /v1',
      );
    }

    return this.apiTokenGuard.canActivate(context);
  }
}
