import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/config', () => ({
  config: { api: { baseURL: 'http://test-api' } },
}));

vi.mock('../api-client', () => ({
  getCsrfToken: vi.fn(async () => 'test-csrf'),
}));

import { packageApiClient } from '../package-api-client';
import { OrdoApiClient } from '@ordo-todo/api-client';
import { getCsrfToken } from '../api-client';

describe('packageApiClient (web singleton)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a package client bound to the web API base URL', () => {
    expect(packageApiClient).toBeInstanceOf(OrdoApiClient);
  });

  it('delegates CSRF to the shared web token cache', async () => {
    const provider = (packageApiClient as unknown as {
      csrfTokenProvider: () => Promise<string | null>;
    }).csrfTokenProvider;

    await expect(provider()).resolves.toBe('test-csrf');
    expect(getCsrfToken).toHaveBeenCalled();
  });
});
