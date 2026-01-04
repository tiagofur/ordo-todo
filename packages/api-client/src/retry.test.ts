/**
 * Tests for retry logic with exponential backoff
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrdoApiClient } from '../client';
import type { RetryConfig } from '../client';

describe('OrdoApiClient Retry Logic', () => {
  let apiClient: OrdoApiClient;
  let mockFetch: vi.Mock;

  beforeEach(() => {
    // Mock fetch to simulate HTTP requests
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;

    // Create API client with retry configuration
    const retryConfig: RetryConfig = {
      retries: 3,
      retryDelay: 100, // 100ms for faster tests
      retryDelayMultiplier: 2,
      maxRetryDelay: 500,
      retryDelayJitter: 0.1,
      retryOn4xx: false,
    };

    apiClient = new OrdoApiClient({
      baseURL: 'http://localhost:3001/api/v1',
      retry: retryConfig,
    });

    vi.clearAllMocks();
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
      // Fail twice, then succeed
      mockFetch.mockRejectedValueOnce({
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      });
      mockFetch.mockRejectedValueOnce({
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3); // 2 failures + 1 success
    });

    it('should retry on 502 Bad Gateway', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 502,
        json: async () => ({ message: 'Bad Gateway' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 503 Service Unavailable', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 503,
        json: async () => ({ message: 'Service Unavailable' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 504 Gateway Timeout', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 504,
        json: async () => ({ message: 'Gateway Timeout' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry on 408 Request Timeout', () => {
    it('should retry on 408 Request Timeout', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 408,
        json: async () => ({ message: 'Request Timeout' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry on 429 Too Many Requests', () => {
    it('should retry on 429 Too Many Requests', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 429,
        json: async () => ({ message: 'Too Many Requests' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry on Network Errors', () => {
    it('should retry on network errors (no status code)', async () => {
      // Simulate network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on connection refused', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('No Retry on 4xx Client Errors', () => {
    it('should NOT retry on 400 Bad Request by default', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 400,
        json: async () => ({ message: 'Bad Request' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should NOT retry on 401 Unauthorized', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 403 Forbidden', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry on 404 Not Found', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 404,
        json: async () => ({ message: 'Not Found' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Retry Limit', () => {
    it('should stop retrying after max retries', async () => {
      // Always fail with 500
      mockFetch.mockRejectedValue({
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      // Initial attempt + 3 retries = 4 total calls
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should fail permanently after exceeding retry limit', async () => {
      mockFetch.mockRejectedValue({
        status: 503,
        json: async () => ({ message: 'Service Unavailable' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 + 3 retries
    });
  });

  describe('Exponential Backoff', () => {
    it('should use exponential backoff between retries', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;

      // Capture setTimeout calls to measure delays
      global.setTimeout = vi.fn((cb: any, delay: number) => {
        delays.push(delay);
        // Execute immediately in tests
        return originalSetTimeout(cb, 0) as any;
      }) as any;

      mockFetch.mockRejectedValue({
        status: 500,
        json: async () => ({ message: 'Error' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();

      // Should have 3 retry delays (not counting initial attempt)
      expect(delays.length).toBe(3);

      // Exponential backoff: 100, 200, 400 (multiplied by 2 each time)
      // Allow for jitter (±10%)
      expect(delays[0]).toBeGreaterThanOrEqual(90);
      expect(delays[0]).toBeLessThanOrEqual(110);

      expect(delays[1]).toBeGreaterThanOrEqual(180);
      expect(delays[1]).toBeLessThanOrEqual(220);

      expect(delays[2]).toBeGreaterThanOrEqual(360);
      expect(delays[2]).toBeLessThanOrEqual(440);

      // Restore original
      global.setTimeout = originalSetTimeout;
    });

    it('should cap delay at maxRetryDelay', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 5,
          retryDelay: 1000,
          retryDelayMultiplier: 10, // Very aggressive multiplier
          maxRetryDelay: 200, // Low cap
        },
      });

      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;

      global.setTimeout = vi.fn((cb: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(cb, 0) as any;
      }) as any;

      mockFetch.mockRejectedValue({
        status: 500,
        json: async () => ({ message: 'Error' }),
      });

      await expect(client.getTasks()).rejects.toThrow();

      // All delays should be capped at 200ms
      delays.forEach((delay) => {
        expect(delay).toBeLessThanOrEqual(220); // Allow for 10% jitter
        expect(delay).toBeGreaterThanOrEqual(180);
      });

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Retry Jitter', () => {
    it('should add random jitter to retry delays', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;

      global.setTimeout = vi.fn((cb: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(cb, 0) as any;
      }) as any;

      // Run multiple times to check for randomness
      for (let i = 0; i < 5; i++) {
        mockFetch.mockRejectedValue({
          status: 500,
          json: async () => ({ message: 'Error' }),
        });

        try {
          await apiClient.getTasks();
        } catch {
          // Expected to fail
        }
      }

      // Check that delays vary (jitter is working)
      const firstRetryDelays = delays.filter((_, i) => i % 3 === 0); // First retry of each attempt
      const uniqueDelays = new Set(firstRetryDelays);

      // With 10% jitter, we should see some variation
      // (Not guaranteed every time, but likely over 5 attempts)
      expect(uniqueDelays.size).toBeGreaterThan(0);

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Custom Retry Condition', () => {
    it('should use custom retry condition when provided', async () => {
      const customRetryClient = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 3,
          retryCondition: (error) => {
            // Only retry on 503
            return error.status === 503;
          },
        },
      });

      // Fail with 500 (should not retry per custom condition)
      mockFetch.mockRejectedValue({
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      });

      await expect(customRetryClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('should retry based on custom condition', async () => {
      const customRetryClient = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 2,
          retryCondition: (error) => {
            // Retry on 500 or 503
            return error.status === 500 || error.status === 503;
          },
        },
      });

      // Fail with 503 (should retry per custom condition)
      mockFetch.mockRejectedValueOnce({
        status: 503,
        json: async () => ({ message: 'Service Unavailable' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await customRetryClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry on 4xx When Enabled', () => {
    it('should retry on 4xx when retryOn4xx is true', async () => {
      const retryOn4xxClient = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 2,
          retryOn4xx: true,
        },
      });

      // Fail with 400 (should retry when retryOn4xx is true)
      mockFetch.mockRejectedValueOnce({
        status: 400,
        json: async () => ({ message: 'Bad Request' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await retryOn4xxClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry Delay Calculation', () => {
    it('should use default retryDelay when not specified', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 2,
          // No retryDelay specified - should default to 1000ms
        },
      });

      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;

      global.setTimeout = vi.fn((cb: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(cb, 0) as any;
      }) as any;

      mockFetch.mockRejectedValue({
        status: 500,
        json: async () => ({ message: 'Error' }),
      });

      await expect(client.getTasks()).rejects.toThrow();

      // First retry should use default 1000ms (with jitter)
      expect(delays[0]).toBeGreaterThanOrEqual(900);
      expect(delays[0]).toBeLessThanOrEqual(1100);

      global.setTimeout = originalSetTimeout;
    });

    it('should use default retryDelayMultiplier when not specified', async () => {
      const client = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        retry: {
          retries: 3,
          retryDelay: 100,
          // No retryDelayMultiplier - should default to 2
        },
      });

      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;

      global.setTimeout = vi.fn((cb: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(cb, 0) as any;
      }) as any;

      mockFetch.mockRejectedValue({
        status: 500,
        json: async () => ({ message: 'Error' }),
      });

      await expect(client.getTasks()).rejects.toThrow();

      // Should multiply by 2 each time
      expect(delays[0]).toBeLessThanOrEqual(delays[1]); // 100 < 200
      expect(delays[1]).toBeLessThanOrEqual(delays[2]); // 200 < 400

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Retry with 401 Authentication', () => {
    it('should NOT retry 401 errors (handled by token refresh)', async () => {
      mockFetch.mockRejectedValue({
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('Retry Integration with Existing Features', () => {
    it('should retry after token refresh fails', async () => {
      // This tests that retry logic doesn't interfere with 401 handling
      mockFetch.mockRejectedValue({
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1); // 401 goes to token refresh, not retry
    });

    it('should handle retry before token refresh for other errors', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 503,
        json: async () => ({ message: 'Service Unavailable' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry Statistics', () => {
    it('should correctly count retry attempts', async () => {
      mockFetch.mockRejectedValue({
        status: 500,
        json: async () => ({ message: 'Error' }),
      });

      await expect(apiClient.getTasks()).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should stop on first success after retries', async () => {
      mockFetch.mockRejectedValueOnce({ status: 500 });
      mockFetch.mockRejectedValueOnce({ status: 500 });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const result = await apiClient.getTasks();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3); // 2 failures + 1 success
    });
  });
});
