import { OrdoApiClient } from './client';
import { LocalStorageTokenStorage } from './utils/storage';

// Get API URL from environment
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return (window as any).NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }
  return 'http://localhost:3001/api/v1';
};

// Pre-configured API client instance
export const apiClient = new OrdoApiClient({
  baseURL: getApiUrl(),
  tokenStorage: new LocalStorageTokenStorage(),
});
