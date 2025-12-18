"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageTokenStorage = exports.MemoryTokenStorage = void 0;
/**
 * In-memory token storage implementation.
 * Useful for testing and development.
 * Tokens are lost when the application is closed.
 */
class MemoryTokenStorage {
    token = null;
    refreshToken = null;
    getToken() {
        return this.token;
    }
    setToken(token) {
        this.token = token;
    }
    removeToken() {
        this.token = null;
    }
    getRefreshToken() {
        return this.refreshToken;
    }
    setRefreshToken(token) {
        this.refreshToken = token;
    }
    removeRefreshToken() {
        this.refreshToken = null;
    }
}
exports.MemoryTokenStorage = MemoryTokenStorage;
/**
 * Browser localStorage-based token storage.
 * Use this for web applications.
 */
class LocalStorageTokenStorage {
    tokenKey = 'ordo_access_token';
    refreshTokenKey = 'ordo_refresh_token';
    getToken() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }
        return window.localStorage.getItem(this.tokenKey);
    }
    setToken(token) {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.tokenKey, token);
        }
    }
    removeToken() {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(this.tokenKey);
        }
    }
    getRefreshToken() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }
        return window.localStorage.getItem(this.refreshTokenKey);
    }
    setRefreshToken(token) {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.refreshTokenKey, token);
        }
    }
    removeRefreshToken() {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(this.refreshTokenKey);
        }
    }
}
exports.LocalStorageTokenStorage = LocalStorageTokenStorage;
