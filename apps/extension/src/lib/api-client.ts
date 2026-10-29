import { OrdoApiClient } from '@ordo-todo/api-client';
import { API_BASE_URL } from './config';
import { WxtTokenStorage, clearSession } from './auth';

export const apiClient = new OrdoApiClient({
  baseURL: API_BASE_URL,
  tokenStorage: new WxtTokenStorage(),
  onAuthError: () => clearSession(),
});
