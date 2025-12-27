/**
 * Error handling utilities for consistent error management across the application
 */

/**
 * API Error response structure from the backend
 */
interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Axios error structure
 */
interface AxiosError {
  response?: {
    data?: ApiErrorResponse | string;
    status?: number;
  };
  message?: string;
}

/**
 * Extracts a user-friendly error message from various error types
 *
 * @param error - The error object (can be Error, AxiosError, ApiErrorResponse, or unknown)
 * @param fallbackMessage - Default message if no error message can be extracted
 * @returns A user-friendly error message string
 *
 * @example
 * ```typescript
 * try {
 *   await createWorkspace(data);
 * } catch (error) {
 *   toast.error(getErrorMessage(error, 'Failed to create workspace'));
 * }
 * ```
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): string {
  // Handle null/undefined
  if (!error) {
    return fallbackMessage;
  }

  // Handle AxiosError (most common in our API calls)
  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    // If response data is an object with a message
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData
    ) {
      return String(responseData.message);
    }

    // If response data is a string
    if (typeof responseData === 'string') {
      return responseData;
    }

    // Fall back to error message
    if (error.message) {
      return error.message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle objects with a message property
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Last resort: return fallback message
  return fallbackMessage;
}

/**
 * Type guard to check if an error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as AxiosError).response !== undefined
  );
}

/**
 * Gets the HTTP status code from an error
 *
 * @param error - The error object
 * @returns The HTTP status code or null if not available
 */
export function getErrorStatusCode(error: unknown): number | null {
  if (isAxiosError(error)) {
    return error.response?.status ?? null;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  ) {
    return (error as { statusCode: number }).statusCode;
  }

  return null;
}

/**
 * Checks if an error is a specific HTTP status code
 *
 * @param error - The error object
 * @param statusCode - The status code to check for
 * @returns True if the error has the specified status code
 */
export function isErrorWithStatus(error: unknown, statusCode: number): boolean {
  return getErrorStatusCode(error) === statusCode;
}

/**
 * Checks if an error is a validation error (400)
 */
export function isValidationError(error: unknown): boolean {
  return isErrorWithStatus(error, 400);
}

/**
 * Checks if an error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  return isErrorWithStatus(error, 401);
}

/**
 * Checks if an error is a forbidden error (403)
 */
export function isForbiddenError(error: unknown): boolean {
  return isErrorWithStatus(error, 403);
}

/**
 * Checks if an error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
  return isErrorWithStatus(error, 404);
}
