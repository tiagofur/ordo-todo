import Store from 'electron-store';
import type { TokenStorage } from '@ordo-todo/api-client';

const store = new Store();

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Electron Store implementation of TokenStorage
 * Persists authentication tokens across app restarts
 */
export class ElectronStoreTokenStorage implements TokenStorage {
  getToken(): string | null {
    return store.get(TOKEN_KEY, null) as string | null;
  }

  setToken(token: string): void {
    store.set(TOKEN_KEY, token);
  }

  removeToken(): void {
    store.delete(TOKEN_KEY);
    store.delete(REFRESH_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return store.get(REFRESH_TOKEN_KEY, null) as string | null;
  }

  setRefreshToken(token: string): void {
    store.set(REFRESH_TOKEN_KEY, token);
  }
}
