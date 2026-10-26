import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter (headersSent)', () => {
  function mockHost(headersSent: boolean) {
    const reply = jest.fn();
    const response = { headersSent };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
    const httpAdapterHost = {
      httpAdapter: {
        reply,
        getRequestUrl: () => '/x',
      },
    } as unknown as HttpAdapterHost;
    return { host, httpAdapterHost, reply };
  }

  it('should reply normally when headers are not sent', () => {
    const { host, httpAdapterHost, reply } = mockHost(false);
    const filter = new GlobalExceptionFilter(httpAdapterHost);
    filter.catch(new Error('boom'), host);
    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('should log and skip the reply when the response was committed', () => {
    const { host, httpAdapterHost, reply } = mockHost(true);
    const filter = new GlobalExceptionFilter(httpAdapterHost);
    const warn = jest
      .spyOn(
        (filter as unknown as { logger: { warn: jest.Mock } }).logger,
        'warn',
      )
      .mockImplementation(() => undefined);

    filter.catch(new Error('boom'), host);

    expect(reply).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Exception after response committed'),
      expect.any(String),
    );
    warn.mockRestore();
  });
});
