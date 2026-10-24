import { OrdoApiClient } from '@ordo-todo/api-client';
import { AsyncStorageTokenStorage } from './storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get the base URL for the API
 * For iOS simulator: use localhost
 * For Android emulator: use 10.0.2.2
 * For physical device: use your machine's IP address
 */
const getBaseURL = (): string => {
  // Check if running on web
  if (Platform.OS === 'web') {
    return (
      process.env.EXPO_PUBLIC_API_URL ||
      Constants.expoConfig?.extra?.apiUrl ||
      'http://localhost:3001/api/v1'
    );
  }

  // For physical devices, use the configured URL or local IP
  if (Constants.isDevice) {
    return (
      process.env.EXPO_PUBLIC_API_URL ||
      Constants.expoConfig?.extra?.apiUrl ||
      'http://192.168.1.10:3001/api/v1' // Replace with your machine's IP
    );
  }

  // For simulators/emulators
  const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return (
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    `http://${localhost}:3001/api/v1`
  );
};

/**
 * Shared API client instance
 * Automatically handles authentication, token refresh, and error handling
 */
export const apiClient = new OrdoApiClient({
  baseURL: getBaseURL(),
  tokenStorage: new AsyncStorageTokenStorage(),
  onTokenRefresh: (response) => {
    console.log('[API Client] Token refreshed successfully');
  },
  onAuthError: () => {
    console.log('[API Client] Authentication error - token expired or invalid');
    // Auth context will handle navigation to login screen
  },
});

// Export the base URL for debugging purposes
export const API_BASE_URL = getBaseURL();

// Log the API URL in development
if (__DEV__) {
  console.log('[API Client] Initialized with base URL:', API_BASE_URL);
}
