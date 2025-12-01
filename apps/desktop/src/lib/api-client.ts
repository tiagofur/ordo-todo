import { OrdoApiClient } from '@ordo-todo/api-client';
import { ElectronStoreTokenStorage } from './storage';

/**
 * API Client Configuration for Desktop App
 *
 * Desktop app connects to NestJS backend at localhost:3101
 * Tokens are persisted using Electron Store
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3101/api/v1';

export const apiClient = new OrdoApiClient({
  baseURL: API_URL,
  tokenStorage: new ElectronStoreTokenStorage(),
  onTokenRefresh: (response) => {
    console.log('[API Client] Token refreshed successfully');
  },
  onAuthError: () => {
    console.log('[API Client] Auth error - token expired');
    // Auth context will handle logout and redirect to login
  },
});

// Export a function to get the current API URL (useful for debugging)
export const getApiUrl = () => API_URL;
