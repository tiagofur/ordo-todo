import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryTokenStorage, LocalStorageTokenStorage } from './utils/storage';

declare global {
  const window: any;
}

describe('TokenStorage', () => {
  describe('MemoryTokenStorage', () => {
    let storage: MemoryTokenStorage;

    beforeEach(() => {
      storage = new MemoryTokenStorage();
    });

    it('should store and retrieve access token', () => {
      storage.setToken('test-access-token');
      expect(storage.getToken()).toBe('test-access-token');
    });

    it('should return null when no token is set', () => {
      expect(storage.getToken()).toBeNull();
    });

    it('should remove access token', () => {
      storage.setToken('test-access-token');
      storage.removeToken();
      expect(storage.getToken()).toBeNull();
    });

    it('should store and retrieve refresh token', () => {
      storage.setRefreshToken('test-refresh-token');
      expect(storage.getRefreshToken()).toBe('test-refresh-token');
    });

    it('should return null when no refresh token is set', () => {
      expect(storage.getRefreshToken()).toBeNull();
    });

    it('should remove refresh token', () => {
      storage.setRefreshToken('test-refresh-token');
      storage.removeRefreshToken();
      expect(storage.getRefreshToken()).toBeNull();
    });

    it('should store both tokens independently', () => {
      storage.setToken('access-token');
      storage.setRefreshToken('refresh-token');

      expect(storage.getToken()).toBe('access-token');
      expect(storage.getRefreshToken()).toBe('refresh-token');

      storage.removeToken();
      expect(storage.getToken()).toBeNull();
      expect(storage.getRefreshToken()).toBe('refresh-token');
    });

    it('should overwrite existing tokens', () => {
      storage.setToken('first-token');
      storage.setToken('second-token');
      expect(storage.getToken()).toBe('second-token');
    });
  });

  describe('LocalStorageTokenStorage', () => {
    let storage: LocalStorageTokenStorage;
    let mockLocalStorage: Storage;
    let originalWindow: any;

    beforeEach(() => {
      originalWindow = global.window;
      mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };
      global.window = {
        localStorage: mockLocalStorage,
      };
      Object.defineProperty(global.window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
      storage = new LocalStorageTokenStorage();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      global.window = originalWindow;
    });

    it('should store access token in localStorage', () => {
      storage.setToken('test-access-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ordo_access_token',
        'test-access-token'
      );
    });

    it('should retrieve access token from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('stored-token');
      const token = storage.getToken();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('ordo_access_token');
      expect(token).toBe('stored-token');
    });

    it('should return null when token not found in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const token = storage.getToken();
      expect(token).toBeNull();
    });

    it('should remove access token from localStorage', () => {
      storage.removeToken();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ordo_access_token');
    });

    it('should store refresh token in localStorage', () => {
      storage.setRefreshToken('test-refresh-token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'ordo_refresh_token',
        'test-refresh-token'
      );
    });

    it('should retrieve refresh token from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('stored-refresh-token');
      const token = storage.getRefreshToken();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('ordo_refresh_token');
      expect(token).toBe('stored-refresh-token');
    });

    it('should remove refresh token from localStorage', () => {
      storage.removeRefreshToken();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ordo_refresh_token');
    });

    it('should return null when window is undefined', () => {
      // Simulate SSR environment
      const originalWindow = global.window;
      // @ts-ignore - intentionally removing window
      delete global.window;

      const ssrStorage = new LocalStorageTokenStorage();
      expect(ssrStorage.getToken()).toBeNull();
      expect(ssrStorage.getRefreshToken()).toBeNull();

      // setToken and removeToken should not throw
      ssrStorage.setToken('test');
      ssrStorage.removeToken();
      ssrStorage.setRefreshToken('test');
      ssrStorage.removeRefreshToken();

      global.window = originalWindow;
    });

    it('should return null when localStorage is not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const noStorage = new LocalStorageTokenStorage();
      expect(noStorage.getToken()).toBeNull();
    });
  });
});
