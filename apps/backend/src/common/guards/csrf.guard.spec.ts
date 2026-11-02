import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { CsrfGuard } from './csrf.guard';
import { CsrfService } from '../../auth/csrf.service';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let reflector: jest.Mocked<Reflector>;
  let csrfService: jest.Mocked<CsrfService>;

  const createContext = (request: {
    method?: string;
    headers?: Record<string, string | undefined>;
    url?: string;
    user?: { id: string } | null;
  }): ExecutionContext =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          method: request.method ?? 'POST',
          headers: request.headers ?? {},
          url: request.url ?? '/tasks',
          user: request.user === undefined ? { id: 'user-1' } : request.user,
        }),
        getResponse: () => ({}),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as jest.Mocked<Reflector>;

    csrfService = {
      validateToken: jest.fn(),
    } as unknown as jest.Mocked<CsrfService>;

    guard = new CsrfGuard(reflector, csrfService);
  });

  it('allows safe methods without a token', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      expect(guard.canActivate(createContext({ method, headers: {} }))).toBe(
        true,
      );
    }
    expect(csrfService.validateToken).not.toHaveBeenCalled();
  });

  it('allows @Public routes without a token', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(guard.canActivate(createContext({ headers: {} }))).toBe(true);
    expect(csrfService.validateToken).not.toHaveBeenCalled();
  });

  it('allows Bearer-authenticated requests without a token', () => {
    expect(
      guard.canActivate(
        createContext({ headers: { authorization: 'Bearer abc' } }),
      ),
    ).toBe(true);
    expect(csrfService.validateToken).not.toHaveBeenCalled();
  });

  it('allows /auth/* flows without a token', () => {
    expect(guard.canActivate(createContext({ url: '/auth/refresh' }))).toBe(
      true,
    );
    expect(csrfService.validateToken).not.toHaveBeenCalled();
  });

  it('allows cookie-authenticated mutations with a valid token', () => {
    csrfService.validateToken.mockReturnValue(true);

    expect(
      guard.canActivate(createContext({ headers: { 'x-csrf-token': 'good' } })),
    ).toBe(true);
    expect(csrfService.validateToken).toHaveBeenCalledWith('good');
  });

  it('denies cookie-authenticated mutations with a missing token', () => {
    expect(() => guard.canActivate(createContext({ headers: {} }))).toThrow(
      expect.objectContaining({ status: 403 }),
    );
  });

  it('denies cookie-authenticated mutations with an invalid token', () => {
    csrfService.validateToken.mockReturnValue(false);

    expect(() =>
      guard.canActivate(createContext({ headers: { 'x-csrf-token': 'bad' } })),
    ).toThrow(expect.objectContaining({ status: 403 }));
  });

  it('ignores non-HTTP contexts', () => {
    const context = {
      getType: () => 'ws',
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
