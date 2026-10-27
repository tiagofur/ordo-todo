import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    // A guard or interceptor may have already answered (e.g. the OAuth
    // authorize redirect to login): replying again throws
    // ERR_HTTP_HEADERS_SENT and masks the real response with a 500.
    // Still log it — post-commit errors are rare and the log is the
    // only trace left.
    if (res?.headersSent) {
      this.logger.warn(
        `Exception after response committed: ${exception instanceof Error ? exception.message : exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
      return;
    }

    console.log(
      '🔍 [GlobalExceptionFilter] Exception caught:',
      exception instanceof Error ? exception.message : exception,
    );
    console.log(
      '🔍 [GlobalExceptionFilter] Exception type:',
      exception instanceof Object &&
        'constructor' in exception &&
        exception.constructor
        ? exception.constructor.name
        : typeof exception,
    );
    if (exception instanceof Error) {
      console.log('🔍 [GlobalExceptionFilter] Stack trace:', exception.stack);
    }

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let code: string | undefined;
    let extra: Record<string, unknown> | undefined;

    // Handle HttpException
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        message = (responseObj.message as string) || message;
        error = (responseObj.error as string) || error;
        // Preserve machine-readable codes (ODD 019 INVITE_*, etc.) so the
        // frontend can map them to precise messages.
        if (typeof responseObj.code === 'string') {
          code = responseObj.code;
        }
        // Preserve any other machine-readable fields the exception carries
        // (ODD 012 PLAN_LIMIT_REACHED: plan, resource, limit, upgradeUrl) —
        // without this they never reach the client.
        const handled = new Set([
          'statusCode',
          'message',
          'error',
          'code',
          'timestamp',
          'path',
        ]);
        for (const [key, value] of Object.entries(responseObj)) {
          if (!handled.has(key) && value !== undefined) {
            (extra ??= {})[key] = value;
          }
        }
      }
    }
    // Handle Prisma Exceptions
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          httpStatus = HttpStatus.CONFLICT;
          message = 'Duplicate entry';
          error = 'Conflict';
          break;
        case 'P2025':
          httpStatus = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'Not Found';
          break;
        case 'P2003':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          error = 'Bad Request';
          break;
        case 'P2014':
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Invalid relation';
          error = 'Bad Request';
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = `Database error: ${exception.message}`;
          error = 'Bad Request';
      }
    }
    // Handle Generic Errors
    else if (exception instanceof Error) {
      message = exception.message;
      // Don't expose internal error details in production for generic errors,
      // but for now we keep it for debugging or check NODE_ENV
      if (process.env.NODE_ENV === 'production') {
        message = 'Internal server error';
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
      error,
      ...(code ? { code } : {}),
      ...(extra ?? {}),
    };

    // Log the error
    if (Number(httpStatus) >= 500) {
      this.logger.error(
        `Status: ${httpStatus} Error: ${JSON.stringify(responseBody)}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `Status: ${httpStatus} Error: ${JSON.stringify(responseBody)}`,
      );
      // Log stack trace for debugging in development even for non-500 errors
      if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
        this.logger.debug(exception.stack);
      }
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
