import type { TokenStorage } from '@ordo-todo/api-client';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Storage implementation of TokenStorage for Desktop Renderer.
 * Uses secure IPC communication with Main process (SafeStorage).
 */
export class ElectronStoreTokenStorage implements TokenStorage {
  async getToken(): Promise<string | null> {
    return window.electronAPI.auth.getToken(TOKEN_KEY);
  }

  async setToken(token: string): Promise<void> {
    await window.electronAPI.auth.setToken(TOKEN_KEY, token);
  }

  async removeToken(): Promise<void> {
    await window.electronAPI.auth.deleteToken(TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return window.electronAPI.auth.getToken(REFRESH_TOKEN_KEY);
  }

  async setRefreshToken(token: string): Promise<void> {
    await window.electronAPI.auth.setToken(REFRESH_TOKEN_KEY, token);
  }

  async removeRefreshToken(): Promise<void> {
    await window.electronAPI.auth.deleteToken(REFRESH_TOKEN_KEY);
  }
}
