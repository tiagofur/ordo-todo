import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { TokenRateLimitGuard } from './token-rate-limit.guard';
import { ThrottlerStorage } from '@nestjs/throttler';

describe('TokenRateLimitGuard', () => {
  const mockStorage = {
    increment: jest.fn(),
  };

  const guard = new TokenRateLimitGuard(
    mockStorage as unknown as ThrottlerStorage,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockContext = (method: string, tokenId?: string, clientId?: string) => {
    const request: Record<string, unknown> = {
      method,
      ip: '1.2.3.4',
      apiToken: tokenId ? { id: tokenId, scopes: ['read'] } : undefined,
      oauth: clientId ? { clientId, scopes: ['read'] } : undefined,
    };
    // Simulate a response object capturing headers
    const headers: Record<string, string> = {};
    const response = {
      header: jest.fn((name: string, value: string) => {
        headers[name] = value;
      }),
    };
    return {
      headers,
      context: {
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => response,
        }),
      } as unknown as ExecutionContext,
    };
  };

  it('should allow reads under the limit and set rate headers', async () => {
    const { headers, context } = mockContext('GET', 'token-1');
    mockStorage.increment.mockResolvedValue({
      totalHits: 5,
      timeToExpire: 50,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockStorage.increment).toHaveBeenCalledWith(
      'pat:token-1:read',
      60_000,
      300,
      0,
      'v1-read',
    );
    expect(headers['X-RateLimit-Limit']).toBe('300');
    expect(headers['X-RateLimit-Remaining']).toBe('295');
  });

  it('should use the stricter write bucket for mutations', async () => {
    const { context } = mockContext('POST', 'token-1');
    mockStorage.increment.mockResolvedValue({
      totalHits: 1,
      timeToExpire: 59,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockStorage.increment).toHaveBeenCalledWith(
      'pat:token-1:write',
      60_000,
      100,
      0,
      'v1-write',
    );
  });

  it('should key OAuth clients by client id', async () => {
    const { context } = mockContext('GET', undefined, 'https://hermes.test');
    mockStorage.increment.mockResolvedValue({
      totalHits: 1,
      timeToExpire: 59,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockStorage.increment).toHaveBeenCalledWith(
      expect.stringContaining('oauth:https://hermes.test:read'),
      60_000,
      300,
      0,
      'v1-read',
    );
  });

  it('should throw 429 with Retry-After when the bucket is exhausted', async () => {
    const { headers, context } = mockContext('GET', 'token-1');
    mockStorage.increment.mockResolvedValue({
      totalHits: 301,
      timeToExpire: 42,
    });

    const promise = guard.canActivate(context);
    await expect(promise).rejects.toThrow(HttpException);
    await promise.catch((error: HttpException) => {
      expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
    expect(headers['Retry-After']).toBe('42');
  });

  it('should fall back to IP keying when no token identity exists', async () => {
    const { context } = mockContext('GET');
    mockStorage.increment.mockResolvedValue({
      totalHits: 1,
      timeToExpire: 59,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockStorage.increment).toHaveBeenCalledWith(
      'ip:1.2.3.4:read',
      60_000,
      300,
      0,
      'v1-read',
    );
  });
});
