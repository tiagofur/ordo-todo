/**
 * Platform-agnostic token storage interface.
 * Implement this interface for different platforms (Web, Mobile, Desktop).
 */
export interface TokenStorage {
  /**
   * Retrieves the authentication token.
   * Can be synchronous or asynchronous depending on platform.
   */
  getToken(): Promise<string | null> | string | null;

  /**
   * Stores the authentication token.
   * Can be synchronous or asynchronous depending on platform.
   */
  setToken(token: string): Promise<void> | void;

  /**
   * Removes the authentication token.
   * Can be synchronous or asynchronous depending on platform.
   */
  removeToken(): Promise<void> | void;

  /**
   * Retrieves the refresh token.
   * Can be synchronous or asynchronous depending on platform.
   */
  getRefreshToken(): Promise<string | null> | string | null;

  /**
   * Stores the refresh token.
   * Can be synchronous or asynchronous depending on platform.
   */
  setRefreshToken(token: string): Promise<void> | void;

  /**
   * Removes the refresh token.
   * Can be synchronous or asynchronous depending on platform.
   */
  removeRefreshToken(): Promise<void> | void;
}

/**
 * In-memory token storage implementation.
 * Useful for testing and development.
 * Tokens are lost when the application is closed.
 */
export class MemoryTokenStorage implements TokenStorage {
  private token: string | null = null;
  private refreshToken: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  removeToken(): void {
    this.token = null;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
  }

  removeRefreshToken(): void {
    this.refreshToken = null;
  }
}

/**
 * Browser localStorage-based token storage.
 * Use this for web applications.
 */
export class LocalStorageTokenStorage implements TokenStorage {
  private readonly tokenKey = 'ordo_access_token';
  private readonly refreshTokenKey = 'ordo_refresh_token';

  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.tokenKey, token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.tokenKey);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  removeRefreshToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.refreshTokenKey);
    }
  }
}
