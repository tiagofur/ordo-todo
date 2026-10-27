import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
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

  // ODD 012 S4: el payload accionable de los límites de plan debe llegar
  // íntegro al cliente (plan, resource, limit, upgradeUrl), no solo
  // message/error/code.
  it('preserva los campos extra de una HttpException de objeto en el cuerpo serializado', () => {
    const { host, httpAdapterHost, reply } = mockHost(false);
    const filter = new GlobalExceptionFilter(httpAdapterHost);
    const exception = new HttpException(
      {
        message: 'Llegaste al límite de 1 espacios de trabajo en el plan Free.',
        error: 'PLAN_LIMIT_REACHED',
        plan: 'free',
        resource: 'workspaces',
        limit: 1,
        upgradeUrl: '/settings/billing',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message: expect.stringContaining('Llegaste al límite'),
        error: 'PLAN_LIMIT_REACHED',
        plan: 'free',
        resource: 'workspaces',
        limit: 1,
        upgradeUrl: '/settings/billing',
      }),
      HttpStatus.PAYMENT_REQUIRED,
    );
  });
});
