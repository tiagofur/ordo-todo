import axios from 'axios';
import { config } from '@/config';
import type {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  CreateProjectDto,
  UpdateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateSubtaskDto,
  CreateTagDto,
  StartTimerDto,
  StopTimerDto,
  GetDailyMetricsParams,
  CreateCommentDto,
  UpdateCommentDto,
  CreateAttachmentDto,
} from '@ordo-todo/api-client';

const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management
const TOKEN_KEY = 'ordo_auth_token';

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth
  register: (data: RegisterDto) => axiosInstance.post('/auth/register', data).then((res) => res.data),
  login: (data: LoginDto) => axiosInstance.post('/auth/login', data).then((res) => res.data),
  logout: () => axiosInstance.post('/auth/logout').then((res) => res.data),

  // User
  getCurrentUser: () => axiosInstance.get('/users/me').then((res) => res.data),
  updateProfile: (data: UpdateProfileDto) => axiosInstance.put('/users/me', data).then((res) => res.data),

  // Workspace
  getWorkspaces: () => axiosInstance.get('/workspaces').then((res) => res.data),
  getWorkspace: (id: string) => axiosInstance.get(`/workspaces/${id}`).then((res) => res.data),
  createWorkspace: (data: CreateWorkspaceDto) => axiosInstance.post('/workspaces', data).then((res) => res.data),
  updateWorkspace: (id: string, data: UpdateWorkspaceDto) => axiosInstance.put(`/workspaces/${id}`, data).then((res) => res.data),
  deleteWorkspace: (id: string) => axiosInstance.delete(`/workspaces/${id}`).then((res) => res.data),
  addWorkspaceMember: (id: string, data: AddMemberDto) => axiosInstance.post(`/workspaces/${id}/members`, data).then((res) => res.data),
  removeWorkspaceMember: (id: string, userId: string) => axiosInstance.delete(`/workspaces/${id}/members/${userId}`).then((res) => res.data),

  // Workflow
  getWorkflows: (workspaceId: string) => axiosInstance.get('/workflows', { params: { workspaceId } }).then((res) => res.data),
  createWorkflow: (data: CreateWorkflowDto) => axiosInstance.post('/workflows', data).then((res) => res.data),
  updateWorkflow: (id: string, data: UpdateWorkflowDto) => axiosInstance.put(`/workflows/${id}`, data).then((res) => res.data),
  deleteWorkflow: (id: string) => axiosInstance.delete(`/workflows/${id}`).then((res) => res.data),

  // Project
  getProjects: (workspaceId: string) => axiosInstance.get('/projects', { params: { workspaceId } }).then((res) => res.data),
  getAllProjects: () => axiosInstance.get('/projects/all').then((res) => res.data),
  getProject: (id: string) => axiosInstance.get(`/projects/${id}`).then((res) => res.data),
  createProject: (data: CreateProjectDto) => axiosInstance.post('/projects', data).then((res) => res.data),
  updateProject: (id: string, data: UpdateProjectDto) => axiosInstance.put(`/projects/${id}`, data).then((res) => res.data),
  archiveProject: (id: string) => axiosInstance.patch(`/projects/${id}/archive`).then((res) => res.data),
  completeProject: (id: string) => axiosInstance.patch(`/projects/${id}/complete`).then((res) => res.data),
  deleteProject: (id: string) => axiosInstance.delete(`/projects/${id}`).then((res) => res.data),

  // Task
  getTasks: (projectId?: string) => axiosInstance.get('/tasks', { params: { projectId } }).then((res) => res.data),
  getTask: (id: string) => axiosInstance.get(`/tasks/${id}`).then((res) => res.data),
  getTaskDetails: (id: string) => axiosInstance.get(`/tasks/${id}/details`).then((res) => res.data),
  createTask: (data: CreateTaskDto) => axiosInstance.post('/tasks', data).then((res) => res.data),
  updateTask: (id: string, data: UpdateTaskDto) => axiosInstance.put(`/tasks/${id}`, data).then((res) => res.data),
  completeTask: (id: string) => axiosInstance.patch(`/tasks/${id}/complete`).then((res) => res.data),
  deleteTask: (id: string) => axiosInstance.delete(`/tasks/${id}`).then((res) => res.data),
  createSubtask: (parentTaskId: string, data: CreateSubtaskDto) => axiosInstance.post(`/tasks/${parentTaskId}/subtasks`, data).then((res) => res.data),

  // Tag
  getTags: (workspaceId: string) => axiosInstance.get('/tags', { params: { workspaceId } }).then((res) => res.data),
  getTaskTags: (taskId: string) => axiosInstance.get(`/tasks/${taskId}/tags`).then((res) => res.data),
  createTag: (data: CreateTagDto) => axiosInstance.post('/tags', data).then((res) => res.data),
  assignTagToTask: (tagId: string, taskId: string) => axiosInstance.post(`/tags/${tagId}/tasks/${taskId}`).then((res) => res.data),
  removeTagFromTask: (tagId: string, taskId: string) => axiosInstance.delete(`/tags/${tagId}/tasks/${taskId}`).then((res) => res.data),
  deleteTag: (id: string) => axiosInstance.delete(`/tags/${id}`).then((res) => res.data),

  // Timer
  getActiveTimer: () => axiosInstance.get('/timers/active').then((res) => res.data),
  startTimer: (data: StartTimerDto) => axiosInstance.post('/timers/start', data).then((res) => res.data),
  stopTimer: (data: StopTimerDto) => axiosInstance.post('/timers/stop', data).then((res) => res.data),
  pauseTimer: (data?: { pauseStartedAt?: Date }) => axiosInstance.post('/timers/pause', data).then((res) => res.data),
  resumeTimer: (data: { pauseStartedAt: Date }) => axiosInstance.post('/timers/resume', data).then((res) => res.data),
  switchTask: (data: { newTaskId: string; type?: string; splitReason?: string }) => axiosInstance.post('/timers/switch-task', data).then((res) => res.data),

  // Analytics
  getDailyMetrics: (params?: GetDailyMetricsParams) => axiosInstance.get('/analytics/daily', { params }).then((res) => res.data),
  getWeeklyMetrics: (params?: { weekStart?: string }) => axiosInstance.get('/analytics/weekly', { params }).then((res) => res.data),
  getMonthlyMetrics: (params?: { monthStart?: string }) => axiosInstance.get('/analytics/monthly', { params }).then((res) => res.data),
  getDateRangeMetrics: (startDate: string, endDate: string) => axiosInstance.get('/analytics/range', { params: { startDate, endDate } }).then((res) => res.data),

  // Comment
  getTaskComments: (taskId: string) => axiosInstance.get(`/tasks/${taskId}/comments`).then((res) => res.data),
  createComment: (data: CreateCommentDto) => axiosInstance.post('/comments', data).then((res) => res.data),
  updateComment: (id: string, data: UpdateCommentDto) => axiosInstance.put(`/comments/${id}`, data).then((res) => res.data),
  deleteComment: (id: string) => axiosInstance.delete(`/comments/${id}`).then((res) => res.data),

  // Attachment
  getTaskAttachments: (taskId: string) => axiosInstance.get(`/tasks/${taskId}/attachments`).then((res) => res.data),
  createAttachment: (data: CreateAttachmentDto) => axiosInstance.post('/attachments', data).then((res) => res.data),
  deleteAttachment: (id: string) => axiosInstance.delete(`/attachments/${id}`).then((res) => res.data),
};
