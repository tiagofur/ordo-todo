import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { SlackSignatureGuard } from './slack-signature.guard';

const SECRET = 'slack-signing-secret-for-tests-000';

function sign(timestamp: string, body: string): string {
  return `v0=${createHmac('sha256', SECRET)
    .update(`v0:${timestamp}:${body}`)
    .digest('hex')}`;
}

describe('SlackSignatureGuard', () => {
  const mockConfigService = {
    get: jest.fn((key: string) =>
      key === 'SLACK_SIGNING_SECRET' ? SECRET : undefined,
    ),
  };
  const guard = new SlackSignatureGuard(
    mockConfigService as unknown as ConfigService,
  );

  function mockContext(headers: Record<string, string>, rawBody: unknown) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers, rawBody }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should accept a correctly signed request', async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = 'token=abc&team_id=T1';
    const context = mockContext(
      {
        'x-slack-signature': sign(timestamp, body),
        'x-slack-request-timestamp': timestamp,
      },
      Buffer.from(body),
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should reject missing, stale and forged signatures with 401', async () => {
    const fresh = Math.floor(Date.now() / 1000).toString();

    await expect(
      guard.canActivate(mockContext({}, Buffer.from('x'))),
    ).rejects.toThrow(UnauthorizedException);

    const stale = (Math.floor(Date.now() / 1000) - 600).toString();
    await expect(
      guard.canActivate(
        mockContext(
          {
            'x-slack-signature': sign(stale, 'x'),
            'x-slack-request-timestamp': stale,
          },
          Buffer.from('x'),
        ),
      ),
    ).rejects.toThrow('Stale Slack request');

    await expect(
      guard.canActivate(
        mockContext(
          {
            'x-slack-signature': 'v0=' + '0'.repeat(64),
            'x-slack-request-timestamp': fresh,
          },
          Buffer.from('tampered'),
        ),
      ),
    ).rejects.toThrow('Invalid Slack signature');
  });
});
