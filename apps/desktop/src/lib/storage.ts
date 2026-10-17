import type { TokenStorage } from '@ordo-todo/api-client';
import { Store } from '@tauri-apps/plugin-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Storage implementation of TokenStorage for Desktop application.
 * Uses persistent Tauri plugin store when running in native shell,
 * with fallback to localStorage.
 */
export class ElectronStoreTokenStorage implements TokenStorage {
  private store: Store | null = null;
  private isTauri: boolean;

  constructor() {
    this.isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (this.isTauri) {
      Store.load('auth_store.bin')
        .then((s) => {
          this.store = s;
        })
        .catch((err) => {
          console.warn('Failed to load Tauri store, using localStorage fallback:', err);
        });
    }
  }

  async getToken(): Promise<string | null> {
    if (this.store) {
      try {
        const val = await this.store.get<string>(TOKEN_KEY);
        if (val !== undefined && val !== null) return val;
      } catch (e) {
        console.warn('Error reading token from Tauri store:', e);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  async setToken(token: string): Promise<void> {
    if (this.store) {
      try {
        await this.store.set(TOKEN_KEY, token);
        await this.store.save();
      } catch (e) {
        console.warn('Error writing token to Tauri store:', e);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  async removeToken(): Promise<void> {
    if (this.store) {
      try {
        await this.store.delete(TOKEN_KEY);
        await this.store.save();
      } catch (e) {
        console.warn('Error removing token from Tauri store:', e);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.store) {
      try {
        const val = await this.store.get<string>(REFRESH_TOKEN_KEY);
        if (val !== undefined && val !== null) return val;
      } catch (e) {
        console.warn('Error reading refresh token from Tauri store:', e);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  async setRefreshToken(token: string): Promise<void> {
    if (this.store) {
      try {
        await this.store.set(REFRESH_TOKEN_KEY, token);
        await this.store.save();
      } catch (e) {
        console.warn('Error writing refresh token to Tauri store:', e);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  async removeRefreshToken(): Promise<void> {
    if (this.store) {
      try {
        await this.store.delete(REFRESH_TOKEN_KEY);
        await this.store.save();
      } catch (e) {
        console.warn('Error removing refresh token from Tauri store:', e);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

export const TauriTokenStorage = ElectronStoreTokenStorage;
