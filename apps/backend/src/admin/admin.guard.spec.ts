import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminGuard, DEFAULT_ADMIN_EMAILS } from './admin.guard';

describe('AdminGuard (ODD 019 A5)', () => {
  const buildGuard = (config: Record<string, string | undefined>) =>
    new AdminGuard({
      get: (key: string) => config[key],
    } as unknown as ConfigService);

  const contextFor = (request: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  it('lets the default admin email through when ADMIN_EMAILS is unset', () => {
    const guard = buildGuard({});

    expect(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', email: DEFAULT_ADMIN_EMAILS[0] },
          headers: {},
        }),
      ),
    ).toBe(true);
  });

  it('matches ADMIN_EMAILS case-insensitively with surrounding spaces', () => {
    const guard = buildGuard({
      ADMIN_EMAILS: ' Boss@Corp.com , peer@corp.com',
    });

    expect(
      guard.canActivate(
        contextFor({
          user: { id: 'u1', email: 'boss@corp.com' },
          headers: {},
        }),
      ),
    ).toBe(true);
  });

  it('rejects non-admin users with 403 ADMIN_REQUIRED', () => {
    const guard = buildGuard({ ADMIN_EMAILS: 'boss@corp.com' });

    let caught: unknown;
    try {
      guard.canActivate(
        contextFor({
          user: { id: 'u2', email: 'pleb@corp.com' },
          headers: {},
        }),
      );
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ForbiddenException);
    expect((caught as ForbiddenException).getResponse()).toMatchObject({
      code: 'ADMIN_REQUIRED',
    });
  });

  it('accepts a matching x-admin-api-key header', () => {
    const guard = buildGuard({ ADMIN_API_KEY: 'secret-key' });

    expect(
      guard.canActivate(
        contextFor({
          user: { id: 'u2', email: 'service@corp.com' },
          headers: { 'x-admin-api-key': 'secret-key' },
        }),
      ),
    ).toBe(true);
  });

  it('rejects a wrong api key even when configured', () => {
    const guard = buildGuard({ ADMIN_API_KEY: 'secret-key' });

    expect(() =>
      guard.canActivate(
        contextFor({
          user: { id: 'u2', email: 'service@corp.com' },
          headers: { 'x-admin-api-key': 'nope' },
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
