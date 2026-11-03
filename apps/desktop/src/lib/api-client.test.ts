import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DesktopApiClient } from './api-client';
import { MemoryTokenStorage } from '@ordo-todo/api-client';

describe('DesktopApiClient', () => {
  let client: DesktopApiClient;
  let mockAxios: any;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DesktopApiClient({
      baseURL: 'http://localhost:3101/api/v1',
      tokenStorage: new MemoryTokenStorage(),
    });
    // Swap the real transport for mocks: no network in tests.
    mockAxios = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    (client as any).axios = mockAxios;
  });

  it('inherits deleteAttachment from the shared package', async () => {
    mockAxios.delete.mockResolvedValue({ data: undefined });

    await client.deleteAttachment('att-1');

    expect(mockAxios.delete).toHaveBeenCalledWith('/attachments/att-1');
  });

  it('inherits getDeletedTasks from the shared package', async () => {
    mockAxios.get.mockResolvedValue({ data: [] });

    await client.getDeletedTasks();

    expect(mockAxios.get).toHaveBeenCalledWith('/tasks/deleted', {
      params: {},
    });
  });

  it('uploads files with progress through the backend endpoint', async () => {
    mockAxios.post.mockResolvedValue({ data: { id: 'att-1' } });
    const onProgress = vi.fn();

    await client.uploadFile(
      'task-1',
      new File(['bytes'], 'f.png', { type: 'image/png' }),
      onProgress,
    );

    expect(mockAxios.post).toHaveBeenCalledWith(
      '/attachments/upload',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  });

  it('keeps report generation as a desktop-only endpoint', async () => {
    mockAxios.post.mockResolvedValue({ data: { id: 'rep-1' } });

    await client.generateReport({ type: 'WEEKLY', scope: 'ws-1' });

    expect(mockAxios.post).toHaveBeenCalledWith('/reports/generate', {
      type: 'WEEKLY',
      scope: 'ws-1',
    });
  });
});
