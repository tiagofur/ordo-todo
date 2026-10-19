import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

export const V1_READ_LIMIT = 300;
export const V1_WRITE_LIMIT = 100;
export const V1_RATE_TTL_MS = 60_000;

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Per-token rate limiting for the public `/v1` API surface.
 *
 * Reads and writes use separate buckets keyed by token identity
 * (`request.apiToken.id` for PATs, `request.oauth.clientId` for OAuth
 * clients), falling back to IP when no identity is present. Exceeding
 * a bucket throws 429 with a `Retry-After` header, following the
 * Stripe/Twitter conventions used by {@link CustomThrottleGuard}.
 *
 * Must run AFTER authentication guards so `request.apiToken` /
 * `request.oauth` are populated.
 */
@Injectable()
export class TokenRateLimitGuard implements CanActivate {
  constructor(
    @Inject(ThrottlerStorage)
    private readonly storage: ThrottlerStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const isWrite = WRITE_METHODS.has(
      (request.method as string | undefined)?.toUpperCase() ?? 'GET',
    );
    const bucket = isWrite ? 'write' : 'read';
    const limit = isWrite ? V1_WRITE_LIMIT : V1_READ_LIMIT;
    const throttlerName = isWrite ? 'v1-write' : 'v1-read';

    const identity = this.identityKey(request);
    const key = `${identity}:${bucket}`;

    const record = await this.storage.increment(
      key,
      V1_RATE_TTL_MS,
      limit,
      0,
      throttlerName,
    );

    const remaining = Math.max(0, limit - record.totalHits);
    response.header?.('X-RateLimit-Limit', String(limit));
    response.header?.('X-RateLimit-Remaining', String(remaining));

    if (record.totalHits > limit) {
      response.header?.('Retry-After', String(record.timeToExpire));
      throw new HttpException(
        `Rate limit exceeded for ${bucket} operations. Retry in ${record.timeToExpire}s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private identityKey(request: {
    apiToken?: { id: string };
    oauth?: { clientId: string };
    ip?: string;
  }): string {
    if (request.apiToken?.id) {
      return `pat:${request.apiToken.id}`;
    }
    if (request.oauth?.clientId) {
      return `oauth:${request.oauth.clientId}`;
    }
    return `ip:${request.ip ?? 'unknown'}`;
  }
}
