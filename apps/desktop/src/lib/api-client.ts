/**
 * Desktop API Client
 *
 * Uses the shared OrdoApiClient from @ordo-todo/api-client with
 * Electron-specific token storage.
 */

import { OrdoApiClient } from '@ordo-todo/api-client';
import { ElectronStoreTokenStorage } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3101/api/v1';

/**
 * Desktop-specific API client with Electron storage
 *
 * Extends the base client only for desktop-specific features.
 * Most endpoints are now in the base client.
 */
export class DesktopApiClient extends OrdoApiClient {
  // ============ TASK DEPENDENCIES (Desktop-specific for now) ============

  async addTaskDependency(blockedTaskId: string, blockingTaskId: string) {
    // access protected axios instance
    const response = await this.axios.post(`/tasks/${blockedTaskId}/dependencies`, { blockingTaskId });
    return response.data;
  }

  async removeTaskDependency(blockedTaskId: string, blockingTaskId: string) {
    const response = await this.axios.delete(`/tasks/${blockedTaskId}/dependencies/${blockingTaskId}`);
    return response.data;
  }

  async getTaskDependencies(taskId: string) {
    const response = await this.axios.get(`/tasks/${taskId}/dependencies`);
    return response.data;
  }
}

export const apiClient = new DesktopApiClient({
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

export const getApiUrl = () => API_URL;
