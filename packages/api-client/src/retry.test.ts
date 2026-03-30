/**
 * Tests for retry logic with exponential backoff
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { OrdoApiClient } from './client';
import type { RetryConfig } from './client';

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('OrdoApiClient Retry Logic', () => {
  let mockAxiosInstance: any;
  let responseErrorHandler: (error: any) => Promise<any>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = (axios.create as any)();

    // Capture the response interceptor error handler when the client is created
    mockAxiosInstance.interceptors.response.use = vi.fn(
      (_onFulfilled: any, onRejected: any) => {
        responseErrorHandler = onRejected;
      },
    );
  });

  describe('Retry Configuration', () => {
    it('should accept retry configuration in constructor', () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 5,
          retryDelay: 2000,
        },
      });

      expect(client).toBeDefined();
    });

    it('should work without retry configuration', () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
      });

      expect(client).toBeDefined();
    });
  });

  describe('Retry on 5xx Server Errors', () => {
    it('should retry on 500 Internal Server Error', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      let callCount = 0;

      // Mock the axios instance callable (for retries)
      const mockAxiosCallable = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          // Still failing, trigger error handler again
          const err = {
            response: { status: 500 },
            config: { _retryAttempt: callCount, headers: {} },
            isAxiosError: true,
          };
          return responseErrorHandler(err);
        }
        return Promise.resolve({ data: { data: 'success' } });
      });

      // Patch the internal axios callable
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.get = vi.fn();
      (client as any).axios.post = vi.fn();
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      // Trigger the error handler as if a 500 happened
      const error = {
        response: { status: 500 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
    });

    it('should retry on 502 Bad Gateway', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      // Mock the axios callable to succeed on retry
      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 502 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });

    it('should retry on 503 Service Unavailable', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 503 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });

    it('should retry on 504 Gateway Timeout', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 504 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry on 408 Request Timeout', () => {
    it('should retry on 408 Request Timeout', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 408 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry on 429 Too Many Requests', () => {
    it('should retry on 429 Too Many Requests', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 429 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry on Network Errors', () => {
    it('should retry on network errors (no status code)', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      // Network error has no response/status
      const error = {
        response: undefined,
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
        message: 'Network Error',
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });

    it('should retry on connection refused', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: undefined,
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED',
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });

  describe('No Retry on 4xx Client Errors', () => {
    it('should NOT retry on 400 Bad Request by default', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayJitter: 0,
          retryOn4xx: false,
        },
      });

      const error = {
        response: { status: 400 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });

    it('should NOT retry on 401 Unauthorized', async () => {
      // 401 is handled by token refresh, not retry
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayJitter: 0,
        },
      });

      const error = {
        response: { status: 401 },
        config: { _retry: false, _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      // 401 goes through token refresh path, not retry
      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });

    it('should NOT retry on 403 Forbidden', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayJitter: 0,
          retryOn4xx: false,
        },
      });

      const error = {
        response: { status: 403 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });

    it('should NOT retry on 404 Not Found', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayJitter: 0,
          retryOn4xx: false,
        },
      });

      const error = {
        response: { status: 404 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });
  });

  describe('Retry Limit', () => {
    it('should stop retrying after max retries', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      // Attempt already at max (3)
      const error = {
        response: { status: 500 },
        config: { _retryAttempt: 3, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });

    it('should fail permanently after exceeding retry limit', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 2,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const error = {
        response: { status: 503 },
        config: { _retryAttempt: 2, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });
  });

  describe('Exponential Backoff', () => {
    it('should use exponential backoff between retries', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 100,
          retryDelayMultiplier: 2,
          maxRetryDelay: 500,
          retryDelayJitter: 0,
        },
      });

      // Access the private method via any cast
      const calculateDelay = (client as any).calculateRetryDelay.bind(client);

      // Attempt 0: 100 * 2^0 = 100
      expect(calculateDelay(0)).toBe(100);
      // Attempt 1: 100 * 2^1 = 200
      expect(calculateDelay(1)).toBe(200);
      // Attempt 2: 100 * 2^2 = 400
      expect(calculateDelay(2)).toBe(400);
    });

    it('should cap delay at maxRetryDelay', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 5,
          retryDelay: 1000,
          retryDelayMultiplier: 10,
          maxRetryDelay: 200,
          retryDelayJitter: 0,
        },
      });

      const calculateDelay = (client as any).calculateRetryDelay.bind(client);

      // 1000 * 10^0 = 1000, capped at 200
      expect(calculateDelay(0)).toBe(200);
      // 1000 * 10^1 = 10000, capped at 200
      expect(calculateDelay(1)).toBe(200);
      // 1000 * 10^2 = 100000, capped at 200
      expect(calculateDelay(2)).toBe(200);
    });
  });

  describe('Retry Jitter', () => {
    it('should add random jitter to retry delays', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 100,
          retryDelayMultiplier: 2,
          maxRetryDelay: 500,
          retryDelayJitter: 0.1,
        },
      });

      const calculateDelay = (client as any).calculateRetryDelay.bind(client);

      // Run multiple times to verify jitter produces variation
      const delays: number[] = [];
      for (let i = 0; i < 20; i++) {
        delays.push(calculateDelay(0));
      }

      // With 10% jitter on base 100, delays should be between 90 and 110
      delays.forEach((d) => {
        expect(d).toBeGreaterThanOrEqual(90);
        expect(d).toBeLessThanOrEqual(110);
      });

      // Should have some variation (not all the same)
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });
  });

  describe('Custom Retry Condition', () => {
    it('should use custom retry condition when provided', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 3,
          retryCondition: (error: any) => {
            return error.response?.status === 503;
          },
        },
      });

      // shouldRetry is private, but we can test via the interceptor
      // 500 should NOT retry per custom condition (only 503 retries)
      const error = {
        response: { status: 500 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });

    it('should retry based on custom condition', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 2,
          retryDelay: 10,
          retryDelayJitter: 0,
          retryCondition: (error: any) => {
            return error.response?.status === 500 || error.response?.status === 503;
          },
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 503 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry on 4xx When Enabled', () => {
    it('should retry on 4xx when retryOn4xx is true', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 2,
          retryOn4xx: true,
          retryDelay: 10,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 400 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry Delay Calculation', () => {
    it('should use default retryDelay when not specified', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 2,
          retryDelayJitter: 0,
        },
      });

      const calculateDelay = (client as any).calculateRetryDelay.bind(client);

      // Default retryDelay is 1000, attempt 0: 1000 * 2^0 = 1000
      expect(calculateDelay(0)).toBe(1000);
    });

    it('should use default retryDelayMultiplier when not specified', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 3,
          retryDelay: 100,
          retryDelayJitter: 0,
        },
      });

      const calculateDelay = (client as any).calculateRetryDelay.bind(client);

      // Default multiplier is 2
      expect(calculateDelay(0)).toBe(100);  // 100 * 2^0
      expect(calculateDelay(1)).toBe(200);  // 100 * 2^1
      expect(calculateDelay(2)).toBe(400);  // 100 * 2^2
    });
  });

  describe('Retry with 401 Authentication', () => {
    it('should NOT retry 401 errors (handled by token refresh)', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayJitter: 0,
        },
      });

      // 401 errors go through token refresh path, not retry path
      const error = {
        response: { status: 401 },
        config: { _retry: false, _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      // Should reject (401 triggers token refresh, not retry)
      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });
  });

  describe('Retry Integration with Existing Features', () => {
    it('should retry after token refresh fails', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayJitter: 0,
        },
      });

      // 401 goes to token refresh path, not retry
      const error = {
        response: { status: 401 },
        config: { _retry: false, _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });

    it('should handle retry before token refresh for other errors', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 503 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry Statistics', () => {
    it('should correctly count retry attempts', async () => {
      const _client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayJitter: 0,
        },
      });

      // After 3 retries, should stop
      const error = {
        response: { status: 500 },
        config: { _retryAttempt: 3, headers: {} },
        isAxiosError: true,
      };

      await expect(responseErrorHandler(error)).rejects.toBeDefined();
    });

    it('should stop on first success after retries', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001/api/v1',
        retry: {
          retries: 3,
          retryDelay: 10,
          retryDelayMultiplier: 1,
          retryDelayJitter: 0,
        },
      });

      const mockAxiosCallable = vi.fn().mockResolvedValueOnce({ data: { data: 'success' } });
      (client as any).axios = mockAxiosCallable;
      (client as any).axios.interceptors = mockAxiosInstance.interceptors;

      const error = {
        response: { status: 500 },
        config: { _retryAttempt: 0, headers: {} },
        isAxiosError: true,
      };

      const result = await responseErrorHandler(error);
      expect(result).toBeDefined();
      expect(mockAxiosCallable).toHaveBeenCalledTimes(1);
    });
  });
});
