import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  SLACK_SIGNATURE_TOLERANCE_MS,
  SLACK_SIGNATURE_VERSION,
} from './slack.constants';

/**
 * Verifies Slack request signatures (S6).
 *
 * Slack signs `v0:{timestamp}:{raw_body}` with HMAC-SHA256 under the
 * signing secret, sent as `X-Slack-Signature` + `X-Slack-Request-Timestamp`.
 * Requests older than 5 minutes are rejected (replay protection).
 * Requires `rawBody: true` in the Nest bootstrap.
 */
@Injectable()
export class SlackSignatureGuard {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signature: string | undefined =
      request.headers?.['x-slack-signature'];
    const timestamp: string | undefined =
      request.headers?.['x-slack-request-timestamp'];
    const rawBody: Buffer | string | undefined = request.rawBody;

    if (!signature || !timestamp || rawBody === undefined) {
      throw new UnauthorizedException('Missing Slack signature');
    }

    const ageMs = Date.now() - Number(timestamp) * 1000;
    if (
      !Number.isFinite(ageMs) ||
      Math.abs(ageMs) > SLACK_SIGNATURE_TOLERANCE_MS
    ) {
      throw new UnauthorizedException('Stale Slack request');
    }

    const secret = this.configService.get<string>('SLACK_SIGNING_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Slack signing is not configured');
    }

    const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
    const base = `${SLACK_SIGNATURE_VERSION}:${timestamp}:${body}`;
    const expected = `${SLACK_SIGNATURE_VERSION}=${createHmac('sha256', secret)
      .update(base)
      .digest('hex')}`;

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid Slack signature');
    }

    return true;
  }
}
