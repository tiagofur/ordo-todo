/**
 * Desktop API Client
 *
 * Uses the shared OrdoApiClient from @ordo-todo/api-client with
 * Electron-specific token storage.
 */

import { OrdoApiClient } from '@ordo-todo/api-client';
import { ElectronStoreTokenStorage } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/**
 * Desktop-specific API client with Electron storage
 *
 * Extends the base client only for desktop-specific features.
 * Most endpoints are now in the base client.
 */
export class DesktopApiClient extends OrdoApiClient {
  // Public method to access base URL
  getBaseUrl(): string {
    return this.axios.defaults.baseURL || '';
  }

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

  // ============ WORKSPACE ENDPOINTS ============

  async getWorkspaceBySlug(slug: string) {
    const response = await this.axios.get(`/workspaces/slug/${slug}`);
    return response.data;
  }

  // ============ ANALYTICS ============

  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const response = await this.axios.get('/analytics', { params });
    return response.data;
  }

  // ============ TASK SHARING ============

  async generateShareToken(taskId: string) {
    const response = await this.axios.post(`/tasks/${taskId}/share`);
    return response.data;
  }

  async getSharedTask(token: string) {
    const response = await this.axios.get(`/tasks/share/${token}`);
    return response.data;
  }

  async getShareUrl(taskId: string) {
    const shareData = await this.generateShareToken(taskId);
    const baseUrl = this.getBaseUrl().endsWith('/api/v1')
      ? this.getBaseUrl().slice(0, -7) // Remove '/api/v1'
      : this.getBaseUrl();
    return `${baseUrl}/share/task/${shareData.token}`;
  }

  // ============ CUSTOM FIELDS ============

  async getProjectCustomFields(projectId: string) {
    const response = await this.axios.get(`/projects/${projectId}/custom-fields`);
    return response.data;
  }

  async createCustomField(projectId: string, data: any) {
    const response = await this.axios.post(`/projects/${projectId}/custom-fields`, data);
    return response.data;
  }

  async updateCustomField(fieldId: string, data: any) {
    const response = await this.axios.put(`/custom-fields/${fieldId}`, data);
    return response.data;
  }

  async deleteCustomField(fieldId: string) {
    const response = await this.axios.delete(`/custom-fields/${fieldId}`);
    return response.data;
  }

  async getTaskCustomValues(taskId: string) {
    const response = await this.axios.get(`/tasks/${taskId}/custom-values`);
    return response.data;
  }

  async setTaskCustomValues(taskId: string, data: { values: any[] }) {
    const response = await this.axios.post(`/tasks/${taskId}/custom-values`, data);
    return response.data;
  }

  // ============ FILE UPLOADS ============

  async uploadFile(taskId: string, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    const response = await this.axios.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  async deleteAttachment(attachmentId: string) {
    const response = await this.axios.delete(`/attachments/${attachmentId}`);
    return response.data;
  }

  async getTaskAttachments(taskId: string) {
    const response = await this.axios.get(`/tasks/${taskId}/attachments`);
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
