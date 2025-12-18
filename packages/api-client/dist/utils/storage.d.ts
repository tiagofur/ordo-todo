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
export declare class MemoryTokenStorage implements TokenStorage {
    private token;
    private refreshToken;
    getToken(): string | null;
    setToken(token: string): void;
    removeToken(): void;
    getRefreshToken(): string | null;
    setRefreshToken(token: string): void;
    removeRefreshToken(): void;
}
/**
 * Browser localStorage-based token storage.
 * Use this for web applications.
 */
export declare class LocalStorageTokenStorage implements TokenStorage {
    private readonly tokenKey;
    private readonly refreshTokenKey;
    getToken(): string | null;
    setToken(token: string): void;
    removeToken(): void;
    getRefreshToken(): string | null;
    setRefreshToken(token: string): void;
    removeRefreshToken(): void;
}
//# sourceMappingURL=storage.d.ts.map