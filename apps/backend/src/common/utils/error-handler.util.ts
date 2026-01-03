import { Logger } from '@nestjs/common';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Standardized Error Handler Utility
 *
 * Provides consistent error handling across all services.
 * Logs errors and converts them to appropriate HttpExceptions.
 *
 * @example
 * ```typescript
 * try {
 *   await this.prisma.task.create({ data });
 * } catch (error) {
 *   handleServiceError(error, this.logger, 'Failed to create task');
 * }
 * ```
 */
export function handleServiceError(
  error: unknown,
  logger: Logger,
  contextMessage: string,
  shouldThrow = true,
): void {
  // Log the error with context
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`${contextMessage}: ${errorMessage}`);

  // If we shouldn't throw, just log and return
  if (!shouldThrow) {
    return;
  }

  // Already an HttpException - rethrow as-is
  if (error instanceof HttpException) {
    throw error;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error);
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException('Invalid data provided');
  }

  // Prisma initialization errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new InternalServerErrorException('Database connection failed');
  }

  // Generic errors with specific messages
  if (error instanceof Error) {
    // Check for common error patterns
    if (isNotFoundError(error)) {
      throw new NotFoundException(error.message);
    }

    if (isConflictError(error)) {
      throw new ConflictException(error.message);
    }

    if (isUnauthorizedError(error)) {
      throw new UnauthorizedException(error.message);
    }

    if (isForbiddenError(error)) {
      throw new ForbiddenException(error.message);
    }

    if (isBadRequestError(error)) {
      throw new BadRequestException(error.message);
    }

    // Default: Internal Server Error
    throw new InternalServerErrorException(
      process.env.NODE_ENV === 'production'
        ? 'An error occurred'
        : error.message,
    );
  }

  // Unknown error type
  throw new InternalServerErrorException('An unexpected error occurred');
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): never {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      throw new ConflictException('A record with this value already exists');

    case 'P2025':
      // Record not found
      throw new NotFoundException('Record not found');

    case 'P2003':
      // Foreign key constraint failed
      throw new BadRequestException('Referenced record does not exist');

    case 'P2014':
      // Invalid relation
      throw new BadRequestException('Invalid relation');

    case 'P2011':
      // Null constraint violation
      throw new BadRequestException('Required field is missing');

    case 'P2018':
      // Required connected records not found
      throw new BadRequestException('Required connected records were not found');

    case 'P2023':
      // Inconsistent column data
      throw new BadRequestException('Invalid data format');

    default:
      // Unknown Prisma error
      throw new BadRequestException(
        `Database error: ${error.code} - ${error.message}`,
      );
  }
}

/**
 * Error type detection helpers
 */
function isNotFoundError(error: Error): boolean {
  const patterns = [
    'not found',
    'não encontrado',
    'no encontrado',
    'not exist',
    'não existe',
  ];
  return patterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern),
  );
}

function isConflictError(error: Error): boolean {
  const patterns = [
    'already exists',
    'já existe',
    'ya existe',
    'duplicate',
    'duplicado',
    'conflict',
  ];
  return patterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern),
  );
}

function isUnauthorizedError(error: Error): boolean {
  const patterns = [
    'unauthorized',
    'não autorizado',
    'no autorizado',
    'invalid credentials',
    'credenciais inválidas',
    'token',
    'authentication',
  ];
  return patterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern),
  );
}

function isForbiddenError(error: Error): boolean {
  const patterns = [
    'forbidden',
    'proibido',
    'prohibido',
    'not allowed',
    'não permitido',
    'no permitido',
    'unauthorized',
  ];
  return patterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern),
  );
}

function isBadRequestError(error: Error): boolean {
  const patterns = [
    'invalid',
    'inválido',
    'invalido',
    'bad request',
    'malformed',
    'required',
  ];
  return patterns.some((pattern) =>
    error.message.toLowerCase().includes(pattern),
  );
}

/**
 * Safe error message extractor
 * Returns a safe error message for logging/user display
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // In production, don't expose internal error details
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred';
    }
    return error.message;
  }
  return String(error);
}

/**
 * Wrap async service calls with error handling
 *
 * @example
 * ```typescript
 * const result = await withErrorHandling(
 *   () => this.prisma.task.create({ data }),
 *   this.logger,
 *   'Failed to create task'
 * );
 * ```
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  logger: Logger,
  contextMessage: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleServiceError(error, logger, contextMessage);
    // TypeScript doesn't know handleServiceError always throws
    throw new InternalServerErrorException('Operation failed');
  }
}

/**
 * Check if user owns a resource
 * Throws ForbiddenException if not
 */
export function verifyOwnership(
  resourceOwnerId: string,
  userId: string,
  resourceType: string = 'resource',
): void {
  if (resourceOwnerId !== userId) {
    throw new ForbiddenException(
      `You do not have permission to access this ${resourceType}`,
    );
  }
}
