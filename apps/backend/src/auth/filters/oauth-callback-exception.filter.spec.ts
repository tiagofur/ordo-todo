import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { OAuthCallbackExceptionFilter } from './oauth-callback-exception.filter';

describe('OAuthCallbackExceptionFilter', () => {
  let filter: OAuthCallbackExceptionFilter;
  let redirect: jest.Mock;

  const createHost = (query: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ query }),
        getResponse: () => ({}),
      }),
    }) as unknown as ArgumentsHost;

  beforeEach(() => {
    redirect = jest.fn();
    const httpAdapterHost = {
      httpAdapter: { redirect },
    } as unknown as HttpAdapterHost;
    filter = new OAuthCallbackExceptionFilter(httpAdapterHost);
  });

  it('redirects native shells to the ordo:// deep link with the error code', () => {
    const exception = new HttpException(
      {
        statusCode: HttpStatus.FORBIDDEN,
        code: 'REGISTRATION_INVITE_ONLY',
        message: 'New account registration requires an invitation code',
      },
      HttpStatus.FORBIDDEN,
    );

    for (const state of ['desktop', 'mobile']) {
      redirect.mockClear();
      filter.catch(exception, createHost({ state }));
      expect(redirect).toHaveBeenCalledWith(
        expect.anything(),
        302,
        'ordo://auth/callback?error=registration_invite_only',
      );
    }
  });

  it('redirects web flows to the login page with the error code', () => {
    const exception = new HttpException(
      {
        statusCode: HttpStatus.FORBIDDEN,
        code: 'REGISTRATION_INVITE_ONLY',
        message: 'New account registration requires an invitation code',
      },
      HttpStatus.FORBIDDEN,
    );

    for (const query of [{}, { state: 'web' }, { state: 'evil' }]) {
      redirect.mockClear();
      filter.catch(exception, createHost(query));
      expect(redirect).toHaveBeenCalledWith(
        expect.anything(),
        302,
        expect.stringMatching(/\/login\?error=registration_invite_only$/),
      );
    }
  });

  it('falls back to oauth_failed for non-HTTP or codeless errors', () => {
    redirect.mockClear();
    filter.catch(new Error('boom'), createHost({ state: 'mobile' }));
    expect(redirect).toHaveBeenCalledWith(
      expect.anything(),
      302,
      'ordo://auth/callback?error=oauth_failed',
    );

    redirect.mockClear();
    filter.catch(
      new HttpException('plain message', HttpStatus.BAD_GATEWAY),
      createHost({}),
    );
    expect(redirect).toHaveBeenCalledWith(
      expect.anything(),
      302,
      expect.stringMatching(/\/login\?error=oauth_failed$/),
    );
  });
});
