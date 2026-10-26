import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor (headersSent)', () => {
  const interceptor = new LoggingInterceptor();

  function mockContext(headersSent: boolean) {
    const setHeader = jest.fn();
    const request: Record<string, unknown> = {
      headers: {},
      method: 'GET',
      ip: '127.0.0.1',
    };
    const response: Record<string, unknown> = { headersSent, setHeader };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
    return { context, response, setHeader };
  }

  it('should set correlation headers on a fresh response', (done) => {
    const { context, setHeader } = mockContext(false);
    interceptor
      .intercept(context, { handle: () => of({ ok: true }) } as never)
      .subscribe({
        next: () => {
          expect(setHeader).toHaveBeenCalledWith(
            'x-request-id',
            expect.any(String),
          );
          expect(setHeader).toHaveBeenCalledWith(
            'x-correlation-id',
            expect.any(String),
          );
          done();
        },
        error: done,
      });
  });

  it('should not touch headers when a guard already answered', (done) => {
    const { context, setHeader } = mockContext(true);
    interceptor
      .intercept(context, { handle: () => of(undefined) } as never)
      .subscribe({
        next: () => {
          expect(setHeader).not.toHaveBeenCalled();
          done();
        },
        error: done,
      });
  });
});
