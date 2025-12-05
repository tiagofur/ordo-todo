import { OrdoApiClient } from '@ordo-todo/api-client';
import { ElectronStoreTokenStorage } from './storage';
import {
  InviteMemberDto,
  AcceptInvitationDto
} from '@ordo-todo/api-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3101/api/v1';

export class DesktopApiClient extends OrdoApiClient {
  // ============ WORKSPACE MEMBERS & INVITATIONS ============

  async getWorkspaceMembers(id: string) {
    // @ts-ignore - access private axios instance
    const response = await this.axios.get(`/workspaces/${id}/members`);
    return response.data;
  }

  async getWorkspaceInvitations(id: string) {
    // @ts-ignore
    const response = await this.axios.get(`/workspaces/${id}/invitations`);
    return response.data;
  }

  async inviteWorkspaceMember(id: string, data: InviteMemberDto) {
    // @ts-ignore
    const response = await this.axios.post(`/workspaces/${id}/invite`, data);
    return response.data;
  }

  async acceptWorkspaceInvitation(data: AcceptInvitationDto) {
    // @ts-ignore
    const response = await this.axios.post('/workspaces/invitations/accept', data);
    return response.data;
  }

  // ============ WORKSPACE SETTINGS ============

  async getWorkspaceSettings(id: string) {
    // @ts-ignore
    const response = await this.axios.get(`/workspaces/${id}/settings`);
    return response.data;
  }

  async updateWorkspaceSettings(id: string, data: {
    defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
    defaultDueTime?: number;
    timezone?: string;
    locale?: string;
  }) {
    // @ts-ignore
    const response = await this.axios.put(`/workspaces/${id}/settings`, data);
    return response.data;
  }

  // ============ WORKSPACE AUDIT LOGS ============

  async getWorkspaceAuditLogs(id: string, params?: { limit?: number; offset?: number }) {
    // @ts-ignore
    const response = await this.axios.get(`/workspaces/${id}/audit-logs`, { params });
    return response.data;
  }

  // ============ ANALYTICS (Missing in base client?) ============

  async getWeeklyMetrics(params?: { weekStart?: string }) {
    // @ts-ignore
    const response = await this.axios.get('/analytics/weekly', { params });
    return response.data;
  }

  async getMonthlyMetrics(params?: { monthStart?: string }) {
    // @ts-ignore
    const response = await this.axios.get('/analytics/monthly', { params });
    return response.data;
  }

  async getDateRangeMetrics(startDate: string, endDate: string) {
    // @ts-ignore
    const response = await this.axios.get('/analytics/range', { params: { startDate, endDate } });
    return response.data;
  }

  async getDashboardStats() {
    // @ts-ignore
    const response = await this.axios.get('/analytics/dashboard-stats');
    return response.data;
  }

  async getHeatmapData() {
    // @ts-ignore
    const response = await this.axios.get('/analytics/heatmap');
    return response.data;
  }

  async getProjectDistribution() {
    // @ts-ignore
    const response = await this.axios.get('/analytics/project-distribution');
    return response.data;
  }

  async getTaskStatusDistribution() {
    // @ts-ignore
    const response = await this.axios.get('/analytics/task-status-distribution');
    return response.data;
  }

  // ============ NOTIFICATIONS ============

  async getNotifications() {
    // @ts-ignore
    const response = await this.axios.get('/notifications');
    return response.data;
  }

  async getUnreadNotificationsCount() {
    // @ts-ignore
    const response = await this.axios.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    // @ts-ignore
    const response = await this.axios.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    // @ts-ignore
    const response = await this.axios.post('/notifications/mark-all-read');
    return response.data;
  }

  // ============ TASK DEPENDENCIES ============

  async addTaskDependency(blockedTaskId: string, blockingTaskId: string) {
    // @ts-ignore
    const response = await this.axios.post(`/tasks/${blockedTaskId}/dependencies`, { blockingTaskId });
    return response.data;
  }

  async removeTaskDependency(blockedTaskId: string, blockingTaskId: string) {
    // @ts-ignore
    const response = await this.axios.delete(`/tasks/${blockedTaskId}/dependencies/${blockingTaskId}`);
    return response.data;
  }

  async getTaskDependencies(taskId: string) {
    // @ts-ignore
    const response = await this.axios.get(`/tasks/${taskId}/dependencies`);
    return response.data;
  }

  async getTaskDetails(taskId: string) {
    // @ts-ignore
    const response = await this.axios.get(`/tasks/${taskId}/details`);
    return response.data;
  }

  // ============ AI ============

  async predictTaskDuration(params: { title?: string; description?: string; category?: string; priority?: string }) {
    // @ts-ignore
    const response = await this.axios.get('/ai/predict-duration', { params });
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
