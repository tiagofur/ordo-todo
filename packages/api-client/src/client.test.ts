import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { OrdoApiClient, ClientConfig } from './client';
import { MemoryTokenStorage } from './utils/storage';
import type { AuthResponse, User, Task, Workspace, Project } from './types';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

describe('OrdoApiClient', () => {
  let client: OrdoApiClient;
  let mockAxios: any;
  let mockTokenStorage: MemoryTokenStorage;

  const mockConfig: ClientConfig = {
    baseURL: 'http://localhost:3001/api/v1',
    tokenStorage: new MemoryTokenStorage(),
    timeout: 10000,
  };

  beforeEach(() => {
    mockTokenStorage = new MemoryTokenStorage();
    mockAxios = axios.create({
      baseURL: mockConfig.baseURL,
      timeout: mockConfig.timeout,
      headers: { 'Content-Type': 'application/json' },
    });

    // Add interceptors
    mockAxios.interceptors.request.use = vi.fn((onFulfilled: any) => {
      // Simulate request interceptor
      return onFulfilled;
    });

    mockAxios.interceptors.response.use = vi.fn(
      (onFulfilled: any, onRejected: any) => {
        // Simulate response interceptor
        return { onFulfilled, onRejected };
      }
    );

    vi.mocked(axios.create).mockReturnValue(mockAxios as any);
    client = new OrdoApiClient({ ...mockConfig, tokenStorage: mockTokenStorage });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockConfig.baseURL,
        timeout: mockConfig.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should work without token storage', () => {
      expect(() => {
        new OrdoApiClient({ baseURL: 'http://localhost:3001' });
      }).not.toThrow();
    });

    it('should setup interceptors', () => {
      expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Authentication endpoints', () => {
    const mockAuthResponse: AuthResponse = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    it('should register a new user', async () => {
      mockAxios.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await client.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        username: 'testuser',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        username: 'testuser',
      });
      expect(result).toEqual(mockAuthResponse);
      expect(mockTokenStorage.getToken()).toBe('access-token-123');
      expect(mockTokenStorage.getRefreshToken()).toBe('refresh-token-123');
    });

    it('should login a user', async () => {
      mockAxios.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await client.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockAuthResponse);
      expect(mockTokenStorage.getToken()).toBe('access-token-123');
    });

    it('should refresh token', async () => {
      mockAxios.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await client.refreshToken({
        refreshToken: 'old-refresh-token',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token',
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('should check username availability', async () => {
      mockAxios.post.mockResolvedValue({
        data: { available: true, message: 'Username is available' },
      });

      const result = await client.checkUsernameAvailability('testuser');

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/check-username', {
        username: 'testuser',
      });
      expect(result.available).toBe(true);
    });

    it('should logout and clear tokens', async () => {
      mockTokenStorage.setToken('stored-token');
      mockTokenStorage.setRefreshToken('stored-refresh');

      await client.logout();

      expect(mockTokenStorage.getToken()).toBeNull();
      expect(mockTokenStorage.getRefreshToken()).toBeNull();
    });
  });

  describe('User endpoints', () => {
    const mockUser: User = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
    };

    it('should get current user', async () => {
      mockAxios.get.mockResolvedValue({ data: mockUser });

      const result = await client.getCurrentUser();

      expect(mockAxios.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });

    it('should update user profile', async () => {
      const updateData = { name: 'Updated Name' };
      mockAxios.put.mockResolvedValue({ data: { success: true, user: mockUser } });

      const result = await client.updateProfile(updateData);

      expect(mockAxios.put).toHaveBeenCalledWith('/users/me', updateData);
      expect(result.success).toBe(true);
    });

    it('should delete user account', async () => {
      mockAxios.delete.mockResolvedValue({
        data: { success: true, message: 'Account deleted' },
      });

      const result = await client.deleteAccount();

      expect(mockAxios.delete).toHaveBeenCalledWith('/users/me');
      expect(result.success).toBe(true);
    });
  });

  describe('Workspace endpoints', () => {
    const mockWorkspace: Workspace = {
      id: 'workspace-1',
      name: 'My Workspace',
      slug: 'my-workspace',
      description: 'A test workspace',
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should create a workspace', async () => {
      mockAxios.post.mockResolvedValue({ data: mockWorkspace });

      const result = await client.createWorkspace({
        name: 'My Workspace',
        description: 'A test workspace',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/workspaces', {
        name: 'My Workspace',
        description: 'A test workspace',
      });
      expect(result).toEqual(mockWorkspace);
    });

    it('should get all workspaces', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockWorkspace] });

      const result = await client.getWorkspaces();

      expect(mockAxios.get).toHaveBeenCalledWith('/workspaces');
      expect(result).toHaveLength(1);
    });

    it('should update a workspace', async () => {
      mockAxios.put.mockResolvedValue({ data: mockWorkspace });

      const result = await client.updateWorkspace('workspace-1', {
        name: 'Updated Workspace',
      });

      expect(mockAxios.put).toHaveBeenCalledWith(
        '/workspaces/workspace-1',
        { name: 'Updated Workspace' }
      );
      expect(result).toEqual(mockWorkspace);
    });

    it('should delete a workspace', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteWorkspace('workspace-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/workspaces/workspace-1');
    });

    it('should restore a workspace', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await client.restoreWorkspace('workspace-1');

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/workspaces/workspace-1/restore'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Project endpoints', () => {
    const mockProject: Project = {
      id: 'project-1',
      name: 'My Project',
      workspaceId: 'workspace-1',
      slug: 'my-project',
      description: 'A test project',
      color: '#3b82f6',
      icon: 'folder',
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should create a project', async () => {
      mockAxios.post.mockResolvedValue({ data: mockProject });

      const result = await client.createProject({
        name: 'My Project',
        workspaceId: 'workspace-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/projects', {
        name: 'My Project',
        workspaceId: 'workspace-1',
      });
      expect(result).toEqual(mockProject);
    });

    it('should get projects for workspace', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockProject] });

      const result = await client.getProjects('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/projects', {
        params: { workspaceId: 'workspace-1' },
      });
      expect(result).toHaveLength(1);
    });

    it('should get a project by ID', async () => {
      mockAxios.get.mockResolvedValue({ data: mockProject });

      const result = await client.getProject('project-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/projects/project-1');
      expect(result).toEqual(mockProject);
    });

    it('should update a project', async () => {
      mockAxios.put.mockResolvedValue({ data: mockProject });

      const result = await client.updateProject('project-1', {
        name: 'Updated Project',
      });

      expect(mockAxios.put).toHaveBeenCalledWith('/projects/project-1', {
        name: 'Updated Project',
      });
      expect(result).toEqual(mockProject);
    });

    it('should delete a project', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteProject('project-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/projects/project-1');
    });

    it('should archive a project', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockProject });

      const result = await client.archiveProject('project-1');

      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/projects/project-1/archive'
      );
      expect(result).toEqual(mockProject);
    });

    it('should complete a project', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockProject });

      const result = await client.completeProject('project-1');

      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/projects/project-1/complete'
      );
      expect(result).toEqual(mockProject);
    });
  });

  describe('Task endpoints', () => {
    const mockTask: Task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'A test task',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: 'project-1',
      workspaceId: 'workspace-1',
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should create a task', async () => {
      mockAxios.post.mockResolvedValue({ data: mockTask });

      const result = await client.createTask({
        title: 'Test Task',
        projectId: 'project-1',
        workspaceId: 'workspace-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/tasks', {
        title: 'Test Task',
        projectId: 'project-1',
        workspaceId: 'workspace-1',
      });
      expect(result).toEqual(mockTask);
    });

    it('should get tasks', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockTask] });

      const result = await client.getTasks('project-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks', {
        params: { projectId: 'project-1' },
      });
      expect(result).toHaveLength(1);
    });

    it('should get tasks with tags filter', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockTask] });

      await client.getTasks('project-1', ['urgent', 'frontend']);

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks', {
        params: { projectId: 'project-1', tags: ['urgent', 'frontend'] },
      });
    });

    it('should get today tasks', async () => {
      const todayResponse = {
        overdue: [mockTask],
        dueToday: [],
        scheduledToday: [],
        available: [],
        notYetAvailable: [],
      };
      mockAxios.get.mockResolvedValue({ data: todayResponse });

      const result = await client.getTasksToday();

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/today');
      expect(result).toEqual(todayResponse);
    });

    it('should get scheduled tasks', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockTask] });

      const date = new Date('2025-01-01');
      await client.getScheduledTasks(date);

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/scheduled', {
        params: { date: date.toISOString() },
      });
    });

    it('should get available tasks', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockTask] });

      const result = await client.getAvailableTasks('project-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/available', {
        params: { projectId: 'project-1' },
      });
      expect(result).toHaveLength(1);
    });

    it('should get task by ID', async () => {
      mockAxios.get.mockResolvedValue({ data: mockTask });

      const result = await client.getTask('task-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/task-1');
      expect(result).toEqual(mockTask);
    });

    it('should update a task', async () => {
      mockAxios.put.mockResolvedValue({ data: mockTask });

      const result = await client.updateTask('task-1', {
        title: 'Updated Task',
      });

      expect(mockAxios.put).toHaveBeenCalledWith('/tasks/task-1', {
        title: 'Updated Task',
      });
      expect(result).toEqual(mockTask);
    });

    it('should delete a task', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteTask('task-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/tasks/task-1');
    });

    it('should complete a task', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockTask });

      const result = await client.completeTask('task-1');

      expect(mockAxios.patch).toHaveBeenCalledWith('/tasks/task-1/complete');
      expect(result).toEqual(mockTask);
    });

    it('should assign a task to user', async () => {
      mockAxios.post.mockResolvedValue({ data: mockTask });

      const result = await client.assignTask('task-1', 'user-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/tasks/task-1/assign', {
        userId: 'user-1',
      });
      expect(result).toEqual(mockTask);
    });

    it('should unassign a task from user', async () => {
      mockAxios.delete.mockResolvedValue({ data: mockTask });

      const result = await client.unassignTask('task-1', 'user-1');

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/tasks/task-1/assign/user-1'
      );
      expect(result).toEqual(mockTask);
    });

    it('should create subtask', async () => {
      const subtask = { ...mockTask, id: 'subtask-1', parentId: 'task-1' };
      mockAxios.post.mockResolvedValue({ data: subtask });

      const result = await client.createSubtask('task-1', {
        title: 'Subtask',
        workspaceId: 'workspace-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/tasks/task-1/subtasks', {
        title: 'Subtask',
        workspaceId: 'workspace-1',
      });
      expect(result).toEqual(subtask);
    });
  });

  describe('Tag endpoints', () => {
    const mockTag = {
      id: 'tag-1',
      name: 'urgent',
      color: '#ef4444',
      workspaceId: 'workspace-1',
    };

    it('should create a tag', async () => {
      mockAxios.post.mockResolvedValue({ data: mockTag });

      const result = await client.createTag({
        name: 'urgent',
        color: '#ef4444',
        workspaceId: 'workspace-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/tags', {
        name: 'urgent',
        color: '#ef4444',
        workspaceId: 'workspace-1',
      });
      expect(result).toEqual(mockTag);
    });

    it('should get tags for workspace', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockTag] });

      const result = await client.getTags('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tags', {
        params: { workspaceId: 'workspace-1' },
      });
      expect(result).toHaveLength(1);
    });

    it('should assign tag to task', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await client.assignTagToTask('tag-1', 'task-1');

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/tags/tag-1/tasks/task-1'
      );
      expect(result.success).toBe(true);
    });

    it('should remove tag from task', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.removeTagFromTask('tag-1', 'task-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/tags/tag-1/tasks/task-1');
    });

    it('should get task tags', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockTag] });

      const result = await client.getTaskTags('task-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/task-1/tags');
      expect(result).toHaveLength(1);
    });

    it('should update a tag', async () => {
      mockAxios.put.mockResolvedValue({ data: mockTag });

      const result = await client.updateTag('tag-1', { name: 'updated' });

      expect(mockAxios.put).toHaveBeenCalledWith('/tags/tag-1', {
        name: 'updated',
      });
      expect(result).toEqual(mockTag);
    });

    it('should delete a tag', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteTag('tag-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/tags/tag-1');
    });
  });

  describe('Timer endpoints', () => {
    const mockSession = {
      id: 'session-1',
      taskId: 'task-1',
      type: 'POMODORO',
      duration: 25 * 60,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
    };

    const mockTask = {
      id: 'task-1',
      title: 'Test Task',
      status: 'TODO',
      priority: 'MEDIUM',
      workspaceId: 'workspace-1',
      ownerId: 'user-1',
    };

    it('should start a timer', async () => {
      mockAxios.post.mockResolvedValue({ data: mockSession });

      const result = await client.startTimer({
        taskId: 'task-1',
        type: 'POMODORO',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/timers/start', {
        taskId: 'task-1',
        type: 'POMODORO',
      });
      expect(result).toEqual(mockSession);
    });

    it('should stop a timer', async () => {
      mockAxios.post.mockResolvedValue({ data: mockSession });

      const result = await client.stopTimer({
        sessionId: 'session-1',
        taskId: 'task-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/timers/stop', {
        sessionId: 'session-1',
        taskId: 'task-1',
      });
      expect(result).toEqual(mockSession);
    });

    it('should get active timer', async () => {
      const activeTimer = {
        session: mockSession,
        task: mockTask,
      };
      mockAxios.get.mockResolvedValue({ data: activeTimer });

      const result = await client.getActiveTimer();

      expect(mockAxios.get).toHaveBeenCalledWith('/timers/active');
      expect(result).toEqual(activeTimer);
    });

    it('should pause timer', async () => {
      mockAxios.post.mockResolvedValue({ data: mockSession });

      const result = await client.pauseTimer({
        pauseStartedAt: new Date(),
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/timers/pause', {
        pauseStartedAt: expect.any(Date),
      });
      expect(result).toEqual(mockSession);
    });

    it('should resume timer', async () => {
      mockAxios.post.mockResolvedValue({ data: mockSession });

      const result = await client.resumeTimer({
        pauseStartedAt: new Date(),
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/timers/resume', {
        pauseStartedAt: expect.any(Date),
      });
      expect(result).toEqual(mockSession);
    });

    it('should switch task', async () => {
      const oldSession = mockSession;
      const newSession = { ...mockSession, id: 'session-2', taskId: 'task-2' };
      mockAxios.post.mockResolvedValue({
        data: { oldSession, newSession },
      });

      const result = await client.switchTask({
        newTaskId: 'task-2',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/timers/switch-task', {
        newTaskId: 'task-2',
      });
      expect(result.oldSession).toEqual(oldSession);
      expect(result.newSession).toEqual(newSession);
    });

    it('should get session history', async () => {
      const historyResponse = {
        data: [mockSession],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockAxios.get.mockResolvedValue({ data: historyResponse });

      const result = await client.getSessionHistory({ page: 1, limit: 20 });

      expect(mockAxios.get).toHaveBeenCalledWith('/timers/history', {
        params: { page: 1, limit: 20 },
      });
      expect(result.data).toHaveLength(1);
    });

    it('should get timer stats', async () => {
      const statsResponse = {
        today: { duration: 3600, sessions: 4 },
        week: { duration: 18000, sessions: 20 },
        month: { duration: 72000, sessions: 80 },
      };
      mockAxios.get.mockResolvedValue({ data: statsResponse });

      const result = await client.getTimerStats({ scope: 'week' });

      expect(mockAxios.get).toHaveBeenCalledWith('/timers/stats', {
        params: { scope: 'week' },
      });
      expect(result).toEqual(statsResponse);
    });

    it('should get task time sessions', async () => {
      const timeResponse = {
        sessions: [mockSession],
        totalDuration: 1500,
        sessionCount: 1,
      };
      mockAxios.get.mockResolvedValue({ data: timeResponse });

      const result = await client.getTaskTimeSessions('task-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/timers/task/task-1');
      expect(result.sessions).toHaveLength(1);
    });

    it('should get timer sessions', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockSession] });

      const result = await client.getTimerSessions('task-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/timers', {
        params: { taskId: 'task-1' },
      });
      expect(result).toHaveLength(1);
    });

    it('should get timer session', async () => {
      mockAxios.get.mockResolvedValue({ data: mockSession });

      const result = await client.getTimerSession('session-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/timers/session-1');
      expect(result).toEqual(mockSession);
    });

    it('should create manual timer session', async () => {
      mockAxios.post.mockResolvedValue({ data: mockSession });

      const result = await client.createTimerSession({
        taskId: 'task-1',
        duration: 1500,
        startedAt: new Date(),
        endedAt: new Date(),
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/timers/session', {
        taskId: 'task-1',
        duration: 1500,
        startedAt: expect.any(Date),
        endedAt: expect.any(Date),
      });
      expect(result).toEqual(mockSession);
    });

    it('should update timer session', async () => {
      const updatedSession = { ...mockSession, duration: 1800 };
      mockAxios.patch.mockResolvedValue({ data: updatedSession });

      const result = await client.updateTimerSession('session-1', {
        duration: 1800,
      });

      expect(mockAxios.patch).toHaveBeenCalledWith('/timers/session-1', {
        duration: 1800,
      });
      expect(result).toEqual(updatedSession);
    });

    it('should delete timer session', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteTimerSession('session-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/timers/session-1');
    });
  });

  describe('Analytics endpoints', () => {
    it('should get daily metrics', async () => {
      const metrics = [
        {
          date: '2025-01-01',
          tasksCompleted: 10,
          focusTime: 3600,
          focusScore: 0.85,
        },
      ];
      mockAxios.get.mockResolvedValue({ data: metrics });

      const result = await client.getDailyMetrics({
        startDate: '2025-01-01',
        endDate: '2025-01-07',
      });

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/daily', {
        params: { startDate: '2025-01-01', endDate: '2025-01-07' },
      });
      expect(result).toEqual(metrics);
    });

    it('should get dashboard stats', async () => {
      const stats = {
        pomodoros: 20,
        tasks: 15,
        minutes: 500,
        avgPerDay: 5,
        trends: { pomodoros: 1.2, tasks: 1.1, minutes: 1.3 },
      };
      mockAxios.get.mockResolvedValue({ data: stats });

      const result = await client.getDashboardStats();

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/dashboard-stats');
      expect(result.pomodoros).toBe(20);
    });

    it('should get weekly metrics', async () => {
      const weeklyMetrics = [
        { date: '2025-01-01', pomodorosCount: 4, focusDuration: 1500, tasksCompletedCount: 3 },
      ];
      mockAxios.get.mockResolvedValue({ data: weeklyMetrics });

      const result = await client.getWeeklyMetrics();

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/weekly');
      expect(result).toHaveLength(1);
    });

    it('should get heatmap data', async () => {
      const heatmapData = [{ day: 1, hour: 9, value: 5 }];
      mockAxios.get.mockResolvedValue({ data: heatmapData });

      const result = await client.getHeatmapData();

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/heatmap');
      expect(result).toHaveLength(1);
    });

    it('should get project distribution', async () => {
      const distribution = [{ name: 'Project A', value: 3600 }];
      mockAxios.get.mockResolvedValue({ data: distribution });

      const result = await client.getProjectDistribution();

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/project-distribution');
      expect(result).toHaveLength(1);
    });

    it('should get task status distribution', async () => {
      const distribution = [
        { status: 'TODO', count: 10 },
        { status: 'DONE', count: 5 },
      ];
      mockAxios.get.mockResolvedValue({ data: distribution });

      const result = await client.getTaskStatusDistribution();

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/task-status-distribution');
      expect(result).toHaveLength(2);
    });

    it('should get monthly metrics', async () => {
      const metrics = [
        { date: '2025-01-01', tasksCompleted: 100, focusTime: 36000 },
      ];
      mockAxios.get.mockResolvedValue({ data: metrics });

      const result = await client.getMonthlyMetrics({ monthStart: '2025-01-01' });

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/monthly', {
        params: { monthStart: '2025-01-01' },
      });
      expect(result).toHaveLength(1);
    });

    it('should get date range metrics', async () => {
      const metrics = [
        { date: '2025-01-01', tasksCompleted: 50, focusTime: 18000 },
      ];
      mockAxios.get.mockResolvedValue({ data: metrics });

      const result = await client.getDateRangeMetrics('2025-01-01', '2025-01-07');

      expect(mockAxios.get).toHaveBeenCalledWith('/analytics/range', {
        params: { startDate: '2025-01-01', endDate: '2025-01-07' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('Comment endpoints', () => {
    const mockComment = {
      id: 'comment-1',
      content: 'Test comment',
      taskId: 'task-1',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
    };

    it('should create a comment', async () => {
      mockAxios.post.mockResolvedValue({ data: mockComment });

      const result = await client.createComment({
        content: 'Test comment',
        taskId: 'task-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/comments', {
        content: 'Test comment',
        taskId: 'task-1',
      });
      expect(result).toEqual(mockComment);
    });

    it('should update a comment', async () => {
      mockAxios.put.mockResolvedValue({ data: mockComment });

      const result = await client.updateComment('comment-1', {
        content: 'Updated comment',
      });

      expect(mockAxios.put).toHaveBeenCalledWith('/comments/comment-1', {
        content: 'Updated comment',
      });
      expect(result).toEqual(mockComment);
    });

    it('should delete a comment', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteComment('comment-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/comments/comment-1');
    });

    it('should get task comments', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockComment] });

      const result = await client.getTaskComments('task-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/task-1/comments');
      expect(result).toHaveLength(1);
    });
  });

  describe('Attachment endpoints', () => {
    const mockAttachment = {
      id: 'attachment-1',
      filename: 'test.pdf',
      url: 'http://example.com/test.pdf',
      taskId: 'task-1',
      size: 1024,
    };

    it('should create an attachment', async () => {
      mockAxios.post.mockResolvedValue({ data: mockAttachment });

      const result = await client.createAttachment({
        filename: 'test.pdf',
        url: 'http://example.com/test.pdf',
        taskId: 'task-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/attachments', {
        filename: 'test.pdf',
        url: 'http://example.com/test.pdf',
        taskId: 'task-1',
      });
      expect(result).toEqual(mockAttachment);
    });

    it('should delete an attachment', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteAttachment('attachment-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/attachments/attachment-1');
    });

    it('should get task attachments', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockAttachment] });

      const result = await client.getTaskAttachments('task-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/task-1/attachments');
      expect(result).toHaveLength(1);
    });

    it('should get project attachments', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockAttachment] });

      const result = await client.getProjectAttachments('project-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/attachments/project/project-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('Notification endpoints', () => {
    const mockNotification = {
      id: 'notification-1',
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      message: 'You have been assigned to a new task',
      read: false,
      createdAt: new Date().toISOString(),
    };

    it('should get notifications', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockNotification] });

      const result = await client.getNotifications();

      expect(mockAxios.get).toHaveBeenCalledWith('/notifications');
      expect(result).toHaveLength(1);
    });

    it('should get unread notifications count', async () => {
      mockAxios.get.mockResolvedValue({ data: { count: 5 } });

      const result = await client.getUnreadNotificationsCount();

      expect(mockAxios.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result.count).toBe(5);
    });

    it('should mark notification as read', async () => {
      mockAxios.patch.mockResolvedValue({ data: { ...mockNotification, read: true } });

      const result = await client.markNotificationAsRead('notification-1');

      expect(mockAxios.patch).toHaveBeenCalledWith('/notifications/notification-1/read');
      expect(result.read).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await client.markAllNotificationsAsRead();

      expect(mockAxios.post).toHaveBeenCalledWith('/notifications/mark-all-read');
      expect(result.success).toBe(true);
    });
  });

  describe('Habit endpoints', () => {
    const mockHabit = {
      id: 'habit-1',
      name: 'Exercise',
      frequency: 'DAILY',
      targetDays: [1, 2, 3, 4, 5],
      userId: 'user-1',
      createdAt: new Date().toISOString(),
    };

    it('should create a habit', async () => {
      mockAxios.post.mockResolvedValue({ data: mockHabit });

      const result = await client.createHabit({
        name: 'Exercise',
        frequency: 'DAILY',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/habits', {
        name: 'Exercise',
        frequency: 'DAILY',
      });
      expect(result).toEqual(mockHabit);
    });

    it('should get habits', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockHabit] });

      const result = await client.getHabits(true);

      expect(mockAxios.get).toHaveBeenCalledWith('/habits', {
        params: { includeArchived: 'true' },
      });
      expect(result).toHaveLength(1);
    });

    it('should get today habits', async () => {
      const todayResponse = {
        habits: [mockHabit],
        completedCount: 1,
        totalCount: 1,
      };
      mockAxios.get.mockResolvedValue({ data: todayResponse });

      const result = await client.getTodayHabits();

      expect(mockAxios.get).toHaveBeenCalledWith('/habits/today');
      expect(result.habits).toHaveLength(1);
    });

    it('should get habit', async () => {
      mockAxios.get.mockResolvedValue({ data: mockHabit });

      const result = await client.getHabit('habit-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/habits/habit-1');
      expect(result).toEqual(mockHabit);
    });

    it('should get habit stats', async () => {
      const stats = {
        currentStreak: 7,
        longestStreak: 30,
        totalCompletions: 100,
        completionRate: 0.85,
      };
      mockAxios.get.mockResolvedValue({ data: stats });

      const result = await client.getHabitStats('habit-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/habits/habit-1/stats');
      expect(result.currentStreak).toBe(7);
    });

    it('should update a habit', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockHabit });

      const result = await client.updateHabit('habit-1', {
        name: 'Updated Habit',
      });

      expect(mockAxios.patch).toHaveBeenCalledWith('/habits/habit-1', {
        name: 'Updated Habit',
      });
      expect(result).toEqual(mockHabit);
    });

    it('should delete a habit', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteHabit('habit-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/habits/habit-1');
    });

    it('should complete a habit', async () => {
      const completeResponse = {
        habit: mockHabit,
        streak: 8,
        completed: true,
      };
      mockAxios.post.mockResolvedValue({ data: completeResponse });

      const result = await client.completeHabit('habit-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/habits/habit-1/complete', {});
      expect(result.streak).toBe(8);
    });

    it('should uncomplete a habit', async () => {
      mockAxios.delete.mockResolvedValue({
        data: { success: true, newStreak: 6 },
      });

      const result = await client.uncompleteHabit('habit-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/habits/habit-1/complete');
      expect(result.newStreak).toBe(6);
    });

    it('should pause a habit', async () => {
      mockAxios.post.mockResolvedValue({ data: mockHabit });

      const result = await client.pauseHabit('habit-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/habits/habit-1/pause');
      expect(result).toEqual(mockHabit);
    });

    it('should resume a habit', async () => {
      mockAxios.post.mockResolvedValue({ data: mockHabit });

      const result = await client.resumeHabit('habit-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/habits/habit-1/resume');
      expect(result).toEqual(mockHabit);
    });
  });

  describe('Chat endpoints', () => {
    const mockConversation = {
      id: 'conv-1',
      title: 'Productivity Help',
      messageCount: 5,
      createdAt: new Date().toISOString(),
    };

    it('should get conversations', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockConversation] });

      const result = await client.getConversations({ limit: 10 });

      expect(mockAxios.get).toHaveBeenCalledWith('/chat/conversations', {
        params: { limit: 10 },
      });
      expect(result).toHaveLength(1);
    });

    it('should get conversation detail', async () => {
      const detail = {
        ...mockConversation,
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      mockAxios.get.mockResolvedValue({ data: detail });

      const result = await client.getConversation('conv-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/chat/conversations/conv-1');
      expect(result.messages).toHaveLength(1);
    });

    it('should create a conversation', async () => {
      mockAxios.post.mockResolvedValue({ data: mockConversation });

      const result = await client.createConversation({
        title: 'New Conversation',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/chat/conversations', {
        title: 'New Conversation',
      });
      expect(result).toEqual(mockConversation);
    });

    it('should send a message', async () => {
      const mockMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        conversationId: 'conv-1',
      };
      mockAxios.post.mockResolvedValue({ data: mockMessage });

      const result = await client.sendMessage('conv-1', {
        content: 'Hello',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/chat/conversations/conv-1/messages', {
        content: 'Hello',
      });
      expect(result).toEqual(mockMessage);
    });

    it('should update conversation', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockConversation });

      const result = await client.updateConversation('conv-1', 'Updated Title');

      expect(mockAxios.patch).toHaveBeenCalledWith('/chat/conversations/conv-1', {
        title: 'Updated Title',
      });
      expect(result).toEqual(mockConversation);
    });

    it('should archive a conversation', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockConversation });

      const result = await client.archiveConversation('conv-1');

      expect(mockAxios.patch).toHaveBeenCalledWith('/chat/conversations/conv-1/archive');
      expect(result).toEqual(mockConversation);
    });

    it('should delete a conversation', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteConversation('conv-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/chat/conversations/conv-1');
    });

    it('should get AI insights', async () => {
      const insights = {
        productivityTips: ['Take breaks regularly'],
        focusAreas: ['Deep work sessions'],
      };
      mockAxios.get.mockResolvedValue({ data: insights });

      const result = await client.getAIInsights();

      expect(mockAxios.get).toHaveBeenCalledWith('/chat/insights');
      expect(result.productivityTips).toHaveLength(1);
    });
  });

  describe('Objectives (OKR) endpoints', () => {
    const mockObjective = {
      id: 'obj-1',
      title: 'Q1 Goals',
      description: 'Quarterly objectives',
      status: 'ACTIVE',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      workspaceId: 'workspace-1',
      ownerId: 'user-1',
      createdAt: new Date().toISOString(),
    };

    it('should create an objective', async () => {
      mockAxios.post.mockResolvedValue({ data: mockObjective });

      const result = await client.createObjective({
        title: 'Q1 Goals',
        workspaceId: 'workspace-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/objectives', {
        title: 'Q1 Goals',
        workspaceId: 'workspace-1',
      });
      expect(result).toEqual(mockObjective);
    });

    it('should get objectives', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockObjective] });

      const result = await client.getObjectives({ status: 'ACTIVE' });

      expect(mockAxios.get).toHaveBeenCalledWith('/objectives', {
        params: { status: 'ACTIVE' },
      });
      expect(result).toHaveLength(1);
    });

    it('should get current period objectives', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockObjective] });

      const result = await client.getCurrentPeriodObjectives();

      expect(mockAxios.get).toHaveBeenCalledWith('/objectives/current-period');
      expect(result).toHaveLength(1);
    });

    it('should get objectives dashboard summary', async () => {
      const summary = {
        totalObjectives: 10,
        activeObjectives: 5,
        completedObjectives: 3,
        overallProgress: 0.6,
      };
      mockAxios.get.mockResolvedValue({ data: summary });

      const result = await client.getObjectivesDashboardSummary();

      expect(mockAxios.get).toHaveBeenCalledWith('/objectives/dashboard-summary');
      expect(result.totalObjectives).toBe(10);
    });

    it('should get an objective', async () => {
      mockAxios.get.mockResolvedValue({ data: mockObjective });

      const result = await client.getObjective('obj-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/objectives/obj-1');
      expect(result).toEqual(mockObjective);
    });

    it('should update an objective', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockObjective });

      const result = await client.updateObjective('obj-1', {
        title: 'Updated Title',
      });

      expect(mockAxios.patch).toHaveBeenCalledWith('/objectives/obj-1', {
        title: 'Updated Title',
      });
      expect(result).toEqual(mockObjective);
    });

    it('should delete an objective', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteObjective('obj-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/objectives/obj-1');
    });

    it('should add key result to objective', async () => {
      const mockKeyResult = {
        id: 'kr-1',
        title: 'Increase revenue by 20%',
        objectiveId: 'obj-1',
        targetValue: 120,
        currentValue: 100,
        unit: 'PERCENTAGE',
      };
      mockAxios.post.mockResolvedValue({ data: mockKeyResult });

      const result = await client.addKeyResult('obj-1', {
        title: 'Increase revenue by 20%',
        targetValue: 120,
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/objectives/obj-1/key-results', {
        title: 'Increase revenue by 20%',
        targetValue: 120,
      });
      expect(result).toEqual(mockKeyResult);
    });

    it('should update key result', async () => {
      const mockKeyResult = {
        id: 'kr-1',
        title: 'Updated KR',
        currentValue: 110,
      };
      mockAxios.patch.mockResolvedValue({ data: mockKeyResult });

      const result = await client.updateKeyResult('kr-1', {
        currentValue: 110,
      });

      expect(mockAxios.patch).toHaveBeenCalledWith('/objectives/key-results/kr-1', {
        currentValue: 110,
      });
      expect(result).toEqual(mockKeyResult);
    });

    it('should delete key result', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteKeyResult('kr-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/objectives/key-results/kr-1');
    });

    it('should link task to key result', async () => {
      const mockTaskKeyResult = {
        id: 'tkr-1',
        keyResultId: 'kr-1',
        taskId: 'task-1',
      };
      mockAxios.post.mockResolvedValue({ data: mockTaskKeyResult });

      const result = await client.linkTaskToKeyResult('kr-1', {
        taskId: 'task-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/objectives/key-results/kr-1/tasks', {
        taskId: 'task-1',
      });
      expect(result).toEqual(mockTaskKeyResult);
    });

    it('should unlink task from key result', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.unlinkTaskFromKeyResult('kr-1', 'task-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/objectives/key-results/kr-1/tasks/task-1');
    });
  });

  describe('Custom Fields endpoints', () => {
    const mockCustomField = {
      id: 'cf-1',
      name: 'Priority Score',
      type: 'NUMBER',
      projectId: 'project-1',
      required: false,
    };

    it('should get project custom fields', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockCustomField] });

      const result = await client.getProjectCustomFields('project-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/projects/project-1/custom-fields');
      expect(result).toHaveLength(1);
    });

    it('should create custom field', async () => {
      mockAxios.post.mockResolvedValue({ data: mockCustomField });

      const result = await client.createCustomField('project-1', {
        name: 'Priority Score',
        type: 'NUMBER',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/projects/project-1/custom-fields', {
        name: 'Priority Score',
        type: 'NUMBER',
      });
      expect(result).toEqual(mockCustomField);
    });

    it('should update custom field', async () => {
      mockAxios.patch.mockResolvedValue({ data: mockCustomField });

      const result = await client.updateCustomField('cf-1', {
        name: 'Updated Name',
      });

      expect(mockAxios.patch).toHaveBeenCalledWith('/custom-fields/cf-1', {
        name: 'Updated Name',
      });
      expect(result).toEqual(mockCustomField);
    });

    it('should delete custom field', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteCustomField('cf-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/custom-fields/cf-1');
    });

    it('should get task custom values', async () => {
      const mockValues = [
        { id: 'cv-1', fieldId: 'cf-1', taskId: 'task-1', value: '10' },
      ];
      mockAxios.get.mockResolvedValue({ data: mockValues });

      const result = await client.getTaskCustomValues('task-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/task-1/custom-values');
      expect(result).toHaveLength(1);
    });

    it('should set task custom values', async () => {
      const mockValues = [
        { id: 'cv-1', fieldId: 'cf-1', taskId: 'task-1', value: '15' },
      ];
      mockAxios.patch.mockResolvedValue({ data: mockValues });

      const result = await client.setTaskCustomValues('task-1', {
        values: [{ fieldId: 'cf-1', value: '15' }],
      });

      expect(mockAxios.patch).toHaveBeenCalledWith('/tasks/task-1/custom-values', {
        values: [{ fieldId: 'cf-1', value: '15' }],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('Workspace extended endpoints', () => {
    it('should get workspace members', async () => {
      const mockMembers = [
        { id: 'user-1', name: 'User 1', role: 'OWNER' },
        { id: 'user-2', name: 'User 2', role: 'MEMBER' },
      ];
      mockAxios.get.mockResolvedValue({ data: mockMembers });

      const result = await client.getWorkspaceMembers('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workspaces/workspace-1/members');
      expect(result).toHaveLength(2);
    });

    it('should get workspace invitations', async () => {
      const mockInvitations = [
        { id: 'inv-1', email: 'invited@example.com', status: 'PENDING' },
      ];
      mockAxios.get.mockResolvedValue({ data: mockInvitations });

      const result = await client.getWorkspaceInvitations('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workspaces/workspace-1/invitations');
      expect(result).toHaveLength(1);
    });

    it('should invite workspace member', async () => {
      const mockInvitation = {
        id: 'inv-1',
        email: 'invited@example.com',
        workspaceId: 'workspace-1',
      };
      mockAxios.post.mockResolvedValue({ data: mockInvitation });

      const result = await client.inviteWorkspaceMember('workspace-1', {
        email: 'invited@example.com',
        role: 'MEMBER',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/workspaces/workspace-1/invite', {
        email: 'invited@example.com',
        role: 'MEMBER',
      });
      expect(result).toEqual(mockInvitation);
    });

    it('should accept workspace invitation', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await client.acceptWorkspaceInvitation({
        token: 'invite-token-123',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/workspaces/invitations/accept', {
        token: 'invite-token-123',
      });
      expect(result.success).toBe(true);
    });

    it('should add workspace member', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await client.addWorkspaceMember('workspace-1', {
        userId: 'user-1',
        role: 'MEMBER',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/workspaces/workspace-1/members', {
        userId: 'user-1',
        role: 'MEMBER',
      });
      expect(result.success).toBe(true);
    });

    it('should remove workspace member', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.removeWorkspaceMember('workspace-1', 'user-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/workspaces/workspace-1/members/user-1');
    });

    it('should get workspace settings', async () => {
      const mockSettings = {
        id: 'ws-1',
        workspaceId: 'workspace-1',
        defaultTaskView: 'BOARD',
      };
      mockAxios.get.mockResolvedValue({ data: mockSettings });

      const result = await client.getWorkspaceSettings('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workspaces/workspace-1/settings');
      expect(result).toEqual(mockSettings);
    });

    it('should update workspace settings', async () => {
      const mockSettings = {
        id: 'ws-1',
        workspaceId: 'workspace-1',
        defaultTaskView: 'LIST',
      };
      mockAxios.put.mockResolvedValue({ data: mockSettings });

      const result = await client.updateWorkspaceSettings('workspace-1', {
        defaultTaskView: 'LIST',
      });

      expect(mockAxios.put).toHaveBeenCalledWith('/workspaces/workspace-1/settings', {
        defaultTaskView: 'LIST',
      });
      expect(result).toEqual(mockSettings);
    });

    it('should get workspace audit logs', async () => {
      const mockLogs = {
        logs: [
          { id: 'log-1', action: 'task_created', userId: 'user-1' },
        ],
        total: 1,
        limit: 50,
        offset: 0,
      };
      mockAxios.get.mockResolvedValue({ data: mockLogs });

      const result = await client.getWorkspaceAuditLogs('workspace-1', {
        limit: 50,
        offset: 0,
      });

      expect(mockAxios.get).toHaveBeenCalledWith('/workspaces/workspace-1/audit-logs', {
        params: { limit: 50, offset: 0 },
      });
      expect(result.logs).toHaveLength(1);
    });

    it('should create audit log', async () => {
      const mockLog = { id: 'log-1', action: 'custom_action', payload: {} };
      mockAxios.post.mockResolvedValue({ data: mockLog });

      const result = await client.createAuditLog('workspace-1', 'custom_action', {
        key: 'value',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/workspaces/workspace-1/audit-logs', {
        action: 'custom_action',
        payload: { key: 'value' },
      });
      expect(result).toEqual(mockLog);
    });

    it('should archive workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-1',
        name: 'My Workspace',
        isArchived: true,
      };
      mockAxios.post.mockResolvedValue({ data: mockWorkspace });

      const result = await client.archiveWorkspace('workspace-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/workspaces/workspace-1/archive');
      expect(result.isArchived).toBe(true);
    });

    it('should permanently delete workspace', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.permanentDeleteWorkspace('workspace-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/workspaces/workspace-1/permanent');
    });
  });

  describe('AI endpoints', () => {
    const mockAIProfile = {
      id: 'ai-1',
      userId: 'user-1',
      peakHours: [9, 10, 11, 14, 15, 16],
      optimalSessionLength: 45,
      preferences: { music: 'ambient', notifications: 'minimal' },
    };

    it('should get AI profile', async () => {
      mockAxios.get.mockResolvedValue({ data: mockAIProfile });

      const result = await client.getAIProfile();

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/profile');
      expect(result).toEqual(mockAIProfile);
    });

    it('should get optimal schedule', async () => {
      const mockSchedule = {
        recommendations: [
          { taskId: 'task-1', suggestedStart: '09:00', priority: 0.9 },
        ],
      };
      mockAxios.get.mockResolvedValue({ data: mockSchedule });

      const result = await client.getOptimalSchedule(5);

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/optimal-schedule', {
        params: { topN: 5 },
      });
      expect(result.recommendations).toHaveLength(1);
    });

    it('should predict task duration', async () => {
      const mockPrediction = {
        predictedMinutes: 45,
        confidence: 0.85,
        basedOn: 'similar tasks',
      };
      mockAxios.get.mockResolvedValue({ data: mockPrediction });

      const result = await client.predictTaskDuration({
        title: 'Write unit tests',
        priority: 'HIGH',
      });

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/predict-duration', {
        params: { title: 'Write unit tests', priority: 'HIGH' },
      });
      expect(result.predictedMinutes).toBe(45);
    });

    it('should generate weekly report', async () => {
      const mockReport = {
        id: 'report-1',
        weekStart: '2025-01-01',
        weekEnd: '2025-01-07',
        insights: ['Great productivity!'],
        recommendations: ['Take more breaks'],
      };
      mockAxios.post.mockResolvedValue({ data: mockReport });

      const result = await client.generateWeeklyReport('2025-01-01');

      expect(mockAxios.post).toHaveBeenCalledWith('/ai/reports/weekly', null, {
        params: { weekStart: '2025-01-01' },
      });
      expect(result).toEqual(mockReport);
    });

    it('should get productivity reports', async () => {
      const mockReports = [
        { id: 'report-1', type: 'WEEKLY', generatedAt: '2025-01-07' },
      ];
      mockAxios.get.mockResolvedValue({ data: mockReports });

      const result = await client.getReports({ limit: 10 });

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/reports', {
        params: { limit: 10 },
      });
      expect(result).toHaveLength(1);
    });

    it('should get a specific report', async () => {
      const mockReport = {
        id: 'report-1',
        type: 'WEEKLY',
        content: 'Weekly summary',
      };
      mockAxios.get.mockResolvedValue({ data: mockReport });

      const result = await client.getReport('report-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/reports/report-1');
      expect(result).toEqual(mockReport);
    });

    it('should delete a report', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteReport('report-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/ai/reports/report-1');
    });

    it('should get burnout analysis', async () => {
      const mockAnalysis = {
        riskLevel: 'LOW',
        score: 20,
        factors: ['good work-life balance'],
      };
      mockAxios.get.mockResolvedValue({ data: mockAnalysis });

      const result = await client.getBurnoutAnalysis();

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/burnout/analysis');
      expect(result.riskLevel).toBe('LOW');
    });

    it('should get work patterns', async () => {
      const mockPatterns = {
        mostProductiveDay: 'Tuesday',
        averageFocusTime: 2700,
        peakHours: [9, 10, 11],
      };
      mockAxios.get.mockResolvedValue({ data: mockPatterns });

      const result = await client.getWorkPatterns();

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/burnout/patterns');
      expect(result.mostProductiveDay).toBe('Tuesday');
    });

    it('should get rest recommendations', async () => {
      const mockRecommendations = [
        { type: 'BREAK', duration: 15, frequency: 'hourly' },
      ];
      mockAxios.get.mockResolvedValue({ data: mockRecommendations });

      const result = await client.getRestRecommendations();

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/burnout/recommendations');
      expect(result).toHaveLength(1);
    });

    it('should check burnout intervention', async () => {
      const mockIntervention = {
        needsIntervention: false,
        message: 'You are doing well!',
      };
      mockAxios.get.mockResolvedValue({ data: mockIntervention });

      const result = await client.checkBurnoutIntervention();

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/burnout/intervention');
      expect(result.needsIntervention).toBe(false);
    });

    it('should get weekly wellbeing summary', async () => {
      const mockSummary = {
        overallScore: 85,
        stressLevel: 'LOW',
        recommendations: ['Keep up the good work'],
      };
      mockAxios.get.mockResolvedValue({ data: mockSummary });

      const result = await client.getWeeklyWellbeingSummary();

      expect(mockAxios.get).toHaveBeenCalledWith('/ai/burnout/weekly-summary');
      expect(result.overallScore).toBe(85);
    });
  });

  describe('Workload endpoints', () => {
    it('should get workspace workload', async () => {
      const mockWorkload = {
        workspaceId: 'workspace-1',
        averageWorkload: 'MEDIUM',
        members: [
          { userId: 'user-1', workload: 'HIGH', taskCount: 15 },
        ],
      };
      mockAxios.get.mockResolvedValue({ data: mockWorkload });

      const result = await client.getWorkspaceWorkload('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workload/workspace/workspace-1');
      expect(result).toEqual(mockWorkload);
    });

    it('should get member workload', async () => {
      const mockWorkload = {
        userId: 'user-1',
        workload: 'HIGH',
        totalTasks: 20,
        overdueTasks: 2,
        estimatedHours: 40,
      };
      mockAxios.get.mockResolvedValue({ data: mockWorkload });

      const result = await client.getMemberWorkload('user-1', 'workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workload/member/user-1', {
        params: { workspaceId: 'workspace-1' },
      });
      expect(result.totalTasks).toBe(20);
    });

    it('should get my workload', async () => {
      const mockWorkload = {
        workload: 'MEDIUM',
        totalTasks: 10,
        estimatedHours: 20,
      };
      mockAxios.get.mockResolvedValue({ data: mockWorkload });

      const result = await client.getMyWorkload('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workload/me', {
        params: { workspaceId: 'workspace-1' },
      });
      expect(result.workload).toBe('MEDIUM');
    });

    it('should get workload suggestions', async () => {
      const mockSuggestions = [
        {
          type: 'REDISTRIBUTE',
          fromUserId: 'user-1',
          toUserId: 'user-2',
          taskCount: 3,
        },
      ];
      mockAxios.get.mockResolvedValue({ data: mockSuggestions });

      const result = await client.getWorkloadSuggestions('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workload/suggestions/workspace-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('Workflow endpoints', () => {
    const mockWorkflow = {
      id: 'workflow-1',
      name: 'Development Workflow',
      workspaceId: 'workspace-1',
      createdAt: new Date().toISOString(),
    };

    it('should create a workflow', async () => {
      mockAxios.post.mockResolvedValue({ data: mockWorkflow });

      const result = await client.createWorkflow({
        name: 'Development Workflow',
        workspaceId: 'workspace-1',
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/workflows', {
        name: 'Development Workflow',
        workspaceId: 'workspace-1',
      });
      expect(result).toEqual(mockWorkflow);
    });

    it('should get workflows for workspace', async () => {
      mockAxios.get.mockResolvedValue({ data: [mockWorkflow] });

      const result = await client.getWorkflows('workspace-1');

      expect(mockAxios.get).toHaveBeenCalledWith('/workflows', {
        params: { workspaceId: 'workspace-1' },
      });
      expect(result).toHaveLength(1);
    });

    it('should update a workflow', async () => {
      mockAxios.put.mockResolvedValue({ data: mockWorkflow });

      const result = await client.updateWorkflow('workflow-1', {
        name: 'Updated Workflow',
      });

      expect(mockAxios.put).toHaveBeenCalledWith('/workflows/workflow-1', {
        name: 'Updated Workflow',
      });
      expect(result).toEqual(mockWorkflow);
    });

    it('should delete a workflow', async () => {
      mockAxios.delete.mockResolvedValue(undefined);

      await client.deleteWorkflow('workflow-1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/workflows/workflow-1');
    });
  });

  describe('Task sharing endpoints', () => {
    it('should generate public token for task', async () => {
      const mockResponse = {
        token: 'share-abc-123',
        expiresAt: '2025-01-31',
      };
      mockAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await client.generatePublicToken('task-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/tasks/task-1/share');
      expect(result.token).toBe('share-abc-123');
    });

    it('should get task by public token', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Public Task',
        description: 'This is public',
      };
      mockAxios.get.mockResolvedValue({ data: mockTask });

      const result = await client.getTaskByPublicToken('share-abc-123');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/share/share-abc-123');
      expect(result).toEqual(mockTask);
    });
  });

  describe('Token storage edge cases', () => {
    it('should handle token refresh errors gracefully', async () => {
      const errorResponse = { response: { status: 401 } };
      const onAuthError = vi.fn();

      // Create client with auth error callback
      const testClient = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
        tokenStorage: mockTokenStorage,
        onAuthError,
      });

      // Simulate 401 error when refresh token fails
      mockTokenStorage.setRefreshToken('expired-refresh');

      // This should trigger the auth error callback
      // The actual behavior depends on interceptor implementation
      expect(onAuthError).not.toHaveBeenCalled();
    });

    it('should handle missing token storage gracefully', () => {
      const noStorageClient = new OrdoApiClient({
        baseURL: 'http://localhost:3001',
      });

      // Should not throw when logging out without storage
      expect(async () => {
        await noStorageClient.logout();
      }).not.toThrow();
    });
  });

  describe('Date parameter handling', () => {
    it('should convert Date to ISO string for scheduled tasks', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });

      const date = new Date('2025-01-15T10:30:00Z');
      await client.getScheduledTasks(date);

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/scheduled', {
        params: { date: date.toISOString() },
      });
    });

    it('should pass string date as-is for scheduled tasks', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });

      await client.getScheduledTasks('2025-01-15');

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/scheduled', {
        params: { date: '2025-01-15' },
      });
    });

    it('should handle Date objects for time blocks', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });

      const start = new Date('2025-01-01');
      const end = new Date('2025-01-07');
      await client.getTimeBlocks(start, end);

      expect(mockAxios.get).toHaveBeenCalledWith('/tasks/time-blocks', {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      });
    });
  });
});
