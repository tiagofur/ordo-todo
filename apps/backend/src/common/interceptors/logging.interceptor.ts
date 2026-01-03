import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request Logging Interceptor
 *
 * Implements structured JSON logging with correlation IDs for distributed tracing.
 * Logs all incoming requests, responses, and errors with full context.
 *
 * Logging follows Google/Twitter standards:
 * - JSON-structured logs for easy parsing
 * - Correlation IDs for distributed tracing
 * - Request/response timing measurement
 * - Request ID for request/response matching
 * - User context (when authenticated)
 *
 * @see {@link https://sre.google/sre-book/chapters/monitoring-distributed-tracing/ | Google SRE Distributed Tracing}
 * @see {@link https://github.com/twitter/commons/blob/master/src/python/twitter/commons/middleware/request_log.py | Twitter Request Logging}
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): any {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    // Generate or retrieve request ID
    const requestId = request.headers['x-request-id'] || uuidv4();
    const correlationId = request.headers['x-correlation-id'] || uuidv4();

    // Add IDs to response headers (for client correlation)
    response.setHeader('x-request-id', requestId);
    response.setHeader('x-correlation-id', correlationId);

    // Extract request context
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers['user-agent'];
    const userId = (request as any).user?.id || 'anonymous';

    // Extract client IP
    const ip = request.ip || request.socket.remoteAddress;
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedString = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    const clientIp = forwardedString ? forwardedString.split(',')[0] : ip;

    const startTime = Date.now();

    // Log incoming request
    this.logger.log({
      message: 'Incoming request',
      requestId,
      correlationId,
      method,
      url,
      userId,
      clientIp,
      userAgent,
    });

    return (next.handle() as any).pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log successful response
          this.logger.log({
            message: 'Request completed successfully',
            requestId,
            correlationId,
            method,
            url,
            userId,
            statusCode,
            duration,
            responseSize: JSON.stringify(data).length,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log error with full context
          this.logger.error({
            message: 'Request failed with error',
            requestId,
            correlationId,
            method,
            url,
            userId,
            clientIp,
            userAgent,
            statusCode,
            duration,
            errorMessage: error.message,
            errorStack: error.stack,
            errorName: error.constructor.name,
          });
        },
      }),
    );
  }
}
