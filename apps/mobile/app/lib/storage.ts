import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TokenStorage } from '@ordo-todo/api-client';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * AsyncStorage-based token storage for React Native
 * Implements the TokenStorage interface from @ordo-todo/api-client
 */
export class AsyncStorageTokenStorage implements TokenStorage {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in AsyncStorage:', error);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error removing tokens from AsyncStorage:', error);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token from AsyncStorage:', error);
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token in AsyncStorage:', error);
    }
  }
  async removeRefreshToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing refresh token from AsyncStorage:', error);
    }
  }
}
