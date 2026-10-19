import { describe, it, expect, beforeEach } from 'vitest';
import { ElectronStoreTokenStorage } from './storage';

describe('TauriTokenStorage', () => {
  let storage: ElectronStoreTokenStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new ElectronStoreTokenStorage();
  });

  it('should store and retrieve token via localStorage fallback', async () => {
    const mockToken = 'test-token-123';
    await storage.setToken(mockToken);

    const token = await storage.getToken();
    expect(token).toBe(mockToken);
  });

  it('should remove token', async () => {
    await storage.setToken('test-token');
    await storage.removeToken();

    const token = await storage.getToken();
    expect(token).toBeNull();
  });

  it('should store and retrieve refresh token', async () => {
    const mockToken = 'test-refresh-token-456';
    await storage.setRefreshToken(mockToken);

    const token = await storage.getRefreshToken();
    expect(token).toBe(mockToken);
  });

  it('should remove refresh token', async () => {
    await storage.setRefreshToken('test-refresh-token');
    await storage.removeRefreshToken();

    const token = await storage.getRefreshToken();
    expect(token).toBeNull();
  });
});
