import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

vi.mock('@/config', () => ({
  config: { api: { baseURL: 'http://test-api' } },
}));

import {
  packageApiClient,
  getCsrfToken,
  invalidateCsrfToken,
} from '../package-api-client';
import { OrdoApiClient } from '@ordo-todo/api-client';

describe('packageApiClient (web singleton)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateCsrfToken();
    vi.mocked(axios.get).mockResolvedValue({ data: { csrfToken: 'test-csrf' } });
  });

  it('is a package client bound to the web API base URL', () => {
    expect(packageApiClient).toBeInstanceOf(OrdoApiClient);
  });

  it('fetches and caches the CSRF token with credentials', async () => {
    await expect(getCsrfToken()).resolves.toBe('test-csrf');
    await expect(getCsrfToken()).resolves.toBe('test-csrf');

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('http://test-api/auth/csrf-token', {
      withCredentials: true,
    });
  });

  it('refetches after invalidation', async () => {
    await getCsrfToken();
    invalidateCsrfToken();
    await getCsrfToken();

    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
