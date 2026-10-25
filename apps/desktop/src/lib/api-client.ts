/**
 * Desktop API Client
 *
 * Uses the shared OrdoApiClient from @ordo-todo/api-client with
 * Electron-specific token storage.
 */

import { OrdoApiClient } from "@ordo-todo/api-client";
import { ElectronStoreTokenStorage } from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3101/api/v1";

/**
 * Desktop-specific API client with Electron storage
 *
 * Extends the base client only for desktop-specific features.
 * Most endpoints are now in the base client.
 */
export class DesktopApiClient extends OrdoApiClient {
  // Public method to access base URL
  getBaseUrl(): string {
    return this.axios.defaults.baseURL || "";
  }

  // ============ AUTH ============

  async checkUsernameAvailability(username: string) {
    const response = await this.axios.post("/auth/check-username", {
      username,
    });
    return response.data;
  }

  // ============ TASK DEPENDENCIES (Desktop-specific for now) ============

  async addTaskDependency(blockedTaskId: string, blockingTaskId: string) {
    // access protected axios instance
    const response = await this.axios.post(
      `/tasks/${blockedTaskId}/dependencies`,
      { blockingTaskId },
    );
    return response.data;
  }

  async removeTaskDependency(blockedTaskId: string, blockingTaskId: string) {
    const response = await this.axios.delete(
      `/tasks/${blockedTaskId}/dependencies/${blockingTaskId}`,
    );
    return response.data;
  }

  async getTaskDependencies(taskId: string) {
    const response = await this.axios.get(`/tasks/${taskId}/dependencies`);
    return response.data;
  }

  // ============ WORKSPACE ENDPOINTS ============

  async getWorkspaceBySlugLegacy(slug: string) {
    const response = await this.axios.get(`/workspaces/slug/${slug}`);
    return response.data;
  }

  // ============ DELETED PROJECTS & TASKS ============

  async getDeletedProjects(workspaceId: string) {
    const response = await this.axios.get("/projects/deleted", {
      params: { workspaceId },
    });
    return response.data;
  }

  async restoreProject(projectId: string) {
    const response = await this.axios.post(`/projects/${projectId}/restore`);
    return response.data;
  }

  async permanentDeleteProject(projectId: string) {
    const response = await this.axios.delete(
      `/projects/${projectId}/permanent`,
    );
    return response.data;
  }

  async getDeletedTasks(projectId: string) {
    const response = await this.axios.get("/tasks/deleted", {
      params: { projectId },
    });
    return response.data;
  }

  async restoreTask(taskId: string) {
    const response = await this.axios.post(`/tasks/${taskId}/restore`);
    return response.data;
  }

  async permanentDeleteTask(taskId: string) {
    const response = await this.axios.delete(`/tasks/${taskId}/permanent`);
    return response.data;
  }

  // ============ ANALYTICS ============

  async getAnalytics(params?: { startDate?: string; endDate?: string }) {
    const response = await this.axios.get("/analytics", { params });
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
    const baseUrl = this.getBaseUrl().endsWith("/api/v1")
      ? this.getBaseUrl().slice(0, -7) // Remove '/api/v1'
      : this.getBaseUrl();
    return `${baseUrl}/share/task/${shareData.token}`;
  }

  // ============ CUSTOM FIELDS ============

  async getProjectCustomFields(projectId: string) {
    const response = await this.axios.get(
      `/projects/${projectId}/custom-fields`,
    );
    return response.data;
  }

  async createCustomField(projectId: string, data: any) {
    const response = await this.axios.post(
      `/projects/${projectId}/custom-fields`,
      data,
    );
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
    const response = await this.axios.post(
      `/tasks/${taskId}/custom-values`,
      data,
    );
    return response.data;
  }

  // ============ FILE UPLOADS ============

  async uploadFile(
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);

    const response = await this.axios.post("/attachments/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
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

  // ============ AI MEETING ANALYZER ============

  async analyzeMeetingTranscript(
    transcript: string,
    options?: {
      meetingTitle?: string;
      participants?: string[];
      duration?: number;
    },
  ) {
    try {
      const response = await this.axios.post("/meetings/analyze", {
        transcript,
        ...options,
      });
      return response.data;
    } catch {
      const response = await this.axios.post("/ai/analyze-meeting", {
        transcript,
      });
      return response.data;
    }
  }

  async convertActionsToTasks(
    actionItems: any[],
    options?: { projectId?: string },
  ) {
    const response = await this.axios.post("/meetings/convert-to-tasks", {
      actionItems,
      ...options,
    });
    return response.data;
  }

  async saveMeeting(data: {
    title: string;
    date: string | Date;
    duration: number;
    transcript?: string;
    audioUrl?: string;
    analysis?: any;
    projectId?: string;
  }) {
    const response = await this.axios.post("/meetings/save", data);
    return response.data;
  }

  async getMeetings(params?: { projectId?: string; limit?: number }) {
    const response = await this.axios.get("/meetings", { params });
    return response.data;
  }

  async deleteMeeting(id: string) {
    const response = await this.axios.delete(`/meetings/${id}`);
    return response.data;
  }

  // ============ REPORTS ============

  async generateReport(params: { type: "WEEKLY" | "MONTHLY"; scope: string }) {
    const response = await this.axios.post("/reports/generate", params);
    return response.data;
  }

  async getReports(params?: {
    scope?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.axios.get("/reports", { params });
    return response.data;
  }

  // ============ GAMIFICATION ============

  async getGamificationProfile(): Promise<{
    xp: number;
    level: number;
    currentLevelProgress: number;
    nextLevelXp: number;
    achievementsTotal: number;
    achievementsUnlocked: number;
    achievements: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      xpReward: number;
      isUnlocked: boolean;
      unlockedAt: string | null;
    }>;
  }> {
    const response = await this.axios.get("/gamification/me");
    return response.data;
  }
}

import { QueryClient } from "@tanstack/react-query";

let queryClientInstance: QueryClient | null = null;

export const registerQueryClient = (client: QueryClient) => {
  queryClientInstance = client;
};

// El 401 del propio logout dentro de onAuthError re-entra aquí; sin guardia,
// la promesa original no resuelve nunca y las pantallas quedan en loading.
let handlingAuthError = false;

export const apiClient = new DesktopApiClient({
  baseURL: API_URL,
  tokenStorage: new ElectronStoreTokenStorage(),
  onTokenRefresh: (response) => {
    console.log("[API Client] Token refreshed successfully");
  },
  onAuthError: async () => {
    if (handlingAuthError) return;
    handlingAuthError = true;
    try {
      console.log("[API Client] Auth error - token expired or invalid");
      try {
        await apiClient.logout();
      } catch {
        // La sesión ya no es válida: basta con limpiar el estado local.
      }

      if (queryClientInstance) {
        queryClientInstance.clear();
      }

      // Auth context will handle logout and redirect to login because of the clear() and logout()
    } finally {
      handlingAuthError = false;
    }
  },
});

export const getApiUrl = () => API_URL;
