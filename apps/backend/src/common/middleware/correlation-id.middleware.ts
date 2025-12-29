import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Correlation ID Middleware
 *
 * Implements distributed tracing by generating and propagating correlation IDs.
 * Ensures that all related requests can be traced across services.
 *
 * @see {@link https://opentracing.io/ | OpenTracing Distributed Tracing}
 * @see {@link https://docs.microsoft.com/en-us/azure/architecture/patterns/distributed-tracing | Microsoft Distributed Tracing}
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Get or generate correlation ID from request headers
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      uuidv4();

    // Add correlation ID to request (for use in services/controllers)
    (req as any).correlationId = correlationId;

    // Add correlation ID to request headers (for propagation)
    req.headers['x-correlation-id'] = correlationId;

    // Add correlation ID to response headers
    res.setHeader('x-correlation-id', correlationId);

    // Add request ID for request/response matching
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    next();
  }
}

// Extend Express Request type to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}
