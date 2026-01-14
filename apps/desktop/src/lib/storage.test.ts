import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ElectronStoreTokenStorage } from './storage';

describe('ElectronStoreTokenStorage', () => {
    let storage: ElectronStoreTokenStorage;

    beforeEach(() => {
        storage = new ElectronStoreTokenStorage();
        vi.clearAllMocks();
    });

    it('should get token via IPC', async () => {
        const mockToken = 'test-token';
        vi.mocked(window.electronAPI.auth.getToken).mockResolvedValue(mockToken);

        const token = await storage.getToken();

        expect(window.electronAPI.auth.getToken).toHaveBeenCalledWith('auth_token');
        expect(token).toBe(mockToken);
    });

    it('should set token via IPC', async () => {
        const mockToken = 'test-token';

        await storage.setToken(mockToken);

        expect(window.electronAPI.auth.setToken).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('should remove token via IPC', async () => {
        await storage.removeToken();

        expect(window.electronAPI.auth.deleteToken).toHaveBeenCalledWith('auth_token');
    });

    it('should get refresh token via IPC', async () => {
        const mockToken = 'test-refresh-token';
        vi.mocked(window.electronAPI.auth.getToken).mockResolvedValue(mockToken);

        const token = await storage.getRefreshToken();

        expect(window.electronAPI.auth.getToken).toHaveBeenCalledWith('refresh_token');
        expect(token).toBe(mockToken);
    });

    it('should set refresh token via IPC', async () => {
        const mockToken = 'test-refresh-token';

        await storage.setRefreshToken(mockToken);

        expect(window.electronAPI.auth.setToken).toHaveBeenCalledWith('refresh_token', mockToken);
    });

    it('should remove refresh token via IPC', async () => {
        await storage.removeRefreshToken();

        expect(window.electronAPI.auth.deleteToken).toHaveBeenCalledWith('refresh_token');
    });
});
