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

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HttpException
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || message;
        error = (response as any).error || error;
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
