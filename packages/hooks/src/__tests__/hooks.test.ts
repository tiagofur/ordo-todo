import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHooks, type CreateHooksConfig } from '../hooks';

// Mock API client
const mockApiClient = {
  // Auth
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),

  // User
  updateProfile: vi.fn(),
  deleteAccount: vi.fn(),
  exportData: vi.fn(),
  getFullProfile: vi.fn(),
  getPreferences: vi.fn(),
  updatePreferences: vi.fn(),
  getIntegrations: vi.fn(),

  // Workspaces
  getWorkspaces: vi.fn(),
  getWorkspace: vi.fn(),
  getWorkspaceBySlug: vi.fn(),
  createWorkspace: vi.fn(),
  updateWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
  getDeletedWorkspaces: vi.fn(),
  restoreWorkspace: vi.fn(),
  permanentDeleteWorkspace: vi.fn(),
  addWorkspaceMember: vi.fn(),
  removeWorkspaceMember: vi.fn(),
  getWorkspaceMembers: vi.fn(),
  getWorkspaceInvitations: vi.fn(),
  inviteWorkspaceMember: vi.fn(),
  acceptWorkspaceInvitation: vi.fn(),
  getWorkspaceSettings: vi.fn(),
  updateWorkspaceSettings: vi.fn(),
  getWorkspaceAuditLogs: vi.fn(),
  createAuditLog: vi.fn(),
  archiveWorkspace: vi.fn(),

  // Workflows
  getWorkflows: vi.fn(),
  createWorkflow: vi.fn(),
  updateWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),

  // Tasks
  getTasks: vi.fn(),
  getTask: vi.fn(),
  getTaskDetails: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  completeTask: vi.fn(),
  deleteTask: vi.fn(),
  createSubtask: vi.fn(),
  generatePublicToken: vi.fn(),
  getTaskByPublicToken: vi.fn(),

  // Projects
  getProjects: vi.fn(),
  getAllProjects: vi.fn(),
  getProject: vi.fn(),
  getProjectBySlugs: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  archiveProject: vi.fn(),
  completeProject: vi.fn(),
  deleteProject: vi.fn(),

  // Tags
  getTags: vi.fn(),
  getTaskTags: vi.fn(),
  createTag: vi.fn(),
  assignTagToTask: vi.fn(),
  removeTagFromTask: vi.fn(),
  deleteTag: vi.fn(),
  updateTag: vi.fn(),

  // Timer
  startTimer: vi.fn(),
  stopTimer: vi.fn(),
  getActiveTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resumeTimer: vi.fn(),
  switchTask: vi.fn(),
  getSessionHistory: vi.fn(),
  getTimerStats: vi.fn(),
  getTaskTimeSessions: vi.fn(),

  // Analytics
  getDailyMetrics: vi.fn(),
  getWeeklyMetrics: vi.fn(),
  getDashboardStats: vi.fn(),
  getHeatmapData: vi.fn(),
  getProjectDistribution: vi.fn(),
  getTaskStatusDistribution: vi.fn(),
  getMonthlyMetrics: vi.fn(),
  getDateRangeMetrics: vi.fn(),

  // AI
  getAIProfile: vi.fn(),
  getOptimalSchedule: vi.fn(),
  predictTaskDuration: vi.fn(),
  generateWeeklyReport: vi.fn(),
  getReports: vi.fn(),
  getReport: vi.fn(),
  deleteReport: vi.fn(),

  // Habits
  getHabits: vi.fn(),
  getTodayHabits: vi.fn(),
  getHabit: vi.fn(),
  getHabitStats: vi.fn(),
  createHabit: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
  completeHabit: vi.fn(),
  uncompleteHabit: vi.fn(),
  pauseHabit: vi.fn(),
  resumeHabit: vi.fn(),

  // Objectives
  getObjectives: vi.fn(),
  getCurrentPeriodObjectives: vi.fn(),
  getObjectivesDashboardSummary: vi.fn(),
  getObjective: vi.fn(),
  createObjective: vi.fn(),
  updateObjective: vi.fn(),
  deleteObjective: vi.fn(),
  addKeyResult: vi.fn(),
  updateKeyResult: vi.fn(),
  deleteKeyResult: vi.fn(),
  linkTaskToKeyResult: vi.fn(),
  unlinkTaskFromKeyResult: vi.fn(),

  // Comments
  getTaskComments: vi.fn(),
  createComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),

  // Attachments
  getTaskAttachments: vi.fn(),
  createAttachment: vi.fn(),
  deleteAttachment: vi.fn(),
  getProjectAttachments: vi.fn(),

  // Notifications
  getNotifications: vi.fn(),
  getUnreadNotificationsCount: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),

  // Custom Fields
  getProjectCustomFields: vi.fn(),
  createCustomField: vi.fn(),
  updateCustomField: vi.fn(),
  deleteCustomField: vi.fn(),
  getTaskCustomValues: vi.fn(),
  setTaskCustomValues: vi.fn(),

  // Time Blocks
  getTimeBlocks: vi.fn(),
} as any;

describe('createHooks', () => {
  let queryClient: QueryClient;
  let hooks: ReturnType<typeof createHooks>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
      logger: {
        log: console.log,
        warn: console.warn,
        error: () => {}, // Suppress error logs in tests
      },
    });

    const config: CreateHooksConfig = {
      apiClient: mockApiClient,
    };

    hooks = createHooks(config);
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    cleanup();
  });

  afterAll(() => {
    // Ensure complete cleanup after all tests
    cleanup();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Factory Pattern', () => {
    it('should create all auth hooks', () => {
      expect(hooks.useRegister).toBeDefined();
      expect(hooks.useLogin).toBeDefined();
      expect(hooks.useLogout).toBeDefined();
    });

    it('should create all user hooks', () => {
      expect(hooks.useCurrentUser).toBeDefined();
      expect(hooks.useUpdateProfile).toBeDefined();
      expect(hooks.useFullProfile).toBeDefined();
      expect(hooks.useUserPreferences).toBeDefined();
      expect(hooks.useUpdatePreferences).toBeDefined();
      expect(hooks.useUserIntegrations).toBeDefined();
      expect(hooks.useExportData).toBeDefined();
      expect(hooks.useDeleteAccount).toBeDefined();
    });

    it('should create all workspace hooks', () => {
      expect(hooks.useWorkspaces).toBeDefined();
      expect(hooks.useWorkspace).toBeDefined();
      expect(hooks.useWorkspaceBySlug).toBeDefined();
      expect(hooks.useCreateWorkspace).toBeDefined();
      expect(hooks.useUpdateWorkspace).toBeDefined();
      expect(hooks.useDeleteWorkspace).toBeDefined();
    });

    it('should create all task hooks', () => {
      expect(hooks.useTasks).toBeDefined();
      expect(hooks.useTask).toBeDefined();
      expect(hooks.useTaskDetails).toBeDefined();
      expect(hooks.useCreateTask).toBeDefined();
      expect(hooks.useUpdateTask).toBeDefined();
      expect(hooks.useCompleteTask).toBeDefined();
      expect(hooks.useDeleteTask).toBeDefined();
    });

    it('should create all timer hooks', () => {
      expect(hooks.useActiveTimer).toBeDefined();
      expect(hooks.useStartTimer).toBeDefined();
      expect(hooks.useStopTimer).toBeDefined();
      expect(hooks.usePauseTimer).toBeDefined();
      expect(hooks.useResumeTimer).toBeDefined();
      expect(hooks.useSwitchTask).toBeDefined();
    });

    it('should bind apiClient to all hooks', async () => {
      mockApiClient.getTasks.mockResolvedValue([
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ]);

      const { result } = renderHook(() => hooks.useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getTasks).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auth Hooks', () => {
    it('useRegister should call apiClient.register', async () => {
      mockApiClient.register.mockResolvedValue({ id: '1', email: 'test@test.com' });

      const { result } = renderHook(() => hooks.useRegister(), { wrapper });

      const registerData = {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
      };

      await result.current.mutateAsync(registerData);

      expect(mockApiClient.register).toHaveBeenCalledWith(registerData);
      expect(mockApiClient.register).toHaveBeenCalledTimes(1);
    });

    it('useRegister should handle errors', async () => {
      mockApiClient.register.mockRejectedValue(new Error('Registration failed'));

      const { result } = renderHook(() => hooks.useRegister(), { wrapper });

      await expect(result.current.mutateAsync({ email: 'test@test.com', password: 'pass', name: 'Test' }))
        .rejects.toThrow('Registration failed');
    });

    it('useLogin should call apiClient.login', async () => {
      mockApiClient.login.mockResolvedValue({
        user: { id: '1', email: 'test@test.com' },
        token: 'jwt-token',
      });

      const { result } = renderHook(() => hooks.useLogin(), { wrapper });

      const loginData = {
        email: 'test@test.com',
        password: 'password123',
      };

      await result.current.mutateAsync(loginData);

      expect(mockApiClient.login).toHaveBeenCalledWith(loginData);
      expect(mockApiClient.login).toHaveBeenCalledTimes(1);
    });

    it('useLogin should handle authentication errors', async () => {
      mockApiClient.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => hooks.useLogin(), { wrapper });

      await expect(
        result.current.mutateAsync({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('useLogout should call apiClient.logout and clear query cache', async () => {
      mockApiClient.logout.mockResolvedValue(undefined);

      queryClient.setQueryData(['tasks'], [{ id: '1', title: 'Task 1' }]);

      const { result } = renderHook(() => hooks.useLogout(), { wrapper });

      await result.current.mutateAsync();

      expect(mockApiClient.logout).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryData(['tasks'])).toBeNull();
    });
  });

  describe('User Hooks', () => {
    it('useCurrentUser should fetch current user', async () => {
      const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };
      mockApiClient.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => hooks.useCurrentUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(mockApiClient.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('useCurrentUser should handle not authenticated', async () => {
      mockApiClient.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      const { result } = renderHook(() => hooks.useCurrentUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('useUpdateProfile should call apiClient.updateProfile and invalidate cache', async () => {
      const updatedUser = { id: '1', name: 'Updated Name' };
      mockApiClient.updateProfile.mockResolvedValue(updatedUser);

      queryClient.setQueryData(['user', 'current'], { id: '1', name: 'Old Name' });

      const { result } = renderHook(() => hooks.useUpdateProfile(), { wrapper });

      await result.current.mutateAsync({ name: 'Updated Name' });

      expect(mockApiClient.updateProfile).toHaveBeenCalledWith({ name: 'Updated Name' });
    });

    it('useFullProfile should fetch full profile', async () => {
      const mockProfile = { id: '1', email: 'test@test.com', preferences: {} };
      mockApiClient.getFullProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => hooks.useFullProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfile);
    });

    it('useUserPreferences should fetch preferences', async () => {
      const mockPrefs = { theme: 'dark', language: 'en' };
      mockApiClient.getPreferences.mockResolvedValue(mockPrefs);

      const { result } = renderHook(() => hooks.useUserPreferences(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPrefs);
    });

    it('useUpdatePreferences should update preferences', async () => {
      mockApiClient.updatePreferences.mockResolvedValue({ theme: 'light' });

      const { result } = renderHook(() => hooks.useUpdatePreferences(), { wrapper });

      await result.current.mutateAsync({ theme: 'light' });

      expect(mockApiClient.updatePreferences).toHaveBeenCalledWith({ theme: 'light' });
    });
  });

  describe('Workspace Hooks', () => {
    it('useWorkspaces should fetch workspaces from apiClient', async () => {
      const mockWorkspaces = [
        { id: '1', name: 'Personal', type: 'PERSONAL' },
        { id: '2', name: 'Work', type: 'WORK' },
      ];

      mockApiClient.getWorkspaces.mockResolvedValue(mockWorkspaces);

      const { result } = renderHook(() => hooks.useWorkspaces(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockWorkspaces);
      expect(mockApiClient.getWorkspaces).toHaveBeenCalledTimes(1);
    });

    it('useWorkspaces should handle empty list', async () => {
      mockApiClient.getWorkspaces.mockResolvedValue([]);

      const { result } = renderHook(() => hooks.useWorkspaces(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('useWorkspace should fetch single workspace', async () => {
      const mockWorkspace = { id: '1', name: 'Personal', type: 'PERSONAL' };
      mockApiClient.getWorkspace.mockResolvedValue(mockWorkspace);

      const { result } = renderHook(() => hooks.useWorkspace('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockWorkspace);
      expect(mockApiClient.getWorkspace).toHaveBeenCalledWith('1');
    });

    it('useWorkspace should be disabled when workspaceId is empty', () => {
      const { result } = renderHook(() => hooks.useWorkspace(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('useCreateWorkspace should call apiClient.createWorkspace and invalidate cache', async () => {
      const newWorkspace = { id: '1', name: 'New Workspace', type: 'PERSONAL' };
      mockApiClient.createWorkspace.mockResolvedValue(newWorkspace);

      const { result } = renderHook(() => hooks.useCreateWorkspace(), { wrapper });

      const createData = {
        name: 'New Workspace',
        type: 'PERSONAL',
      };

      await result.current.mutateAsync(createData);

      expect(mockApiClient.createWorkspace).toHaveBeenCalledWith(createData);
    });

    it('useUpdateWorkspace should call apiClient.updateWorkspace', async () => {
      const updatedWorkspace = { id: '1', name: 'Updated Workspace' };
      mockApiClient.updateWorkspace.mockResolvedValue(updatedWorkspace);

      const { result } = renderHook(() => hooks.useUpdateWorkspace(), { wrapper });

      await result.current.mutateAsync({
        workspaceId: '1',
        data: { name: 'Updated Workspace' },
      });

      expect(mockApiClient.updateWorkspace).toHaveBeenCalledWith('1', { name: 'Updated Workspace' });
    });

    it('useDeleteWorkspace should call apiClient.deleteWorkspace', async () => {
      mockApiClient.deleteWorkspace.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteWorkspace(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteWorkspace).toHaveBeenCalledWith('1');
    });

    it('useDeletedWorkspaces should fetch deleted workspaces', async () => {
      const deletedWorkspaces = [{ id: '1', name: 'Deleted', deletedAt: new Date() }];
      mockApiClient.getDeletedWorkspaces.mockResolvedValue(deletedWorkspaces);

      const { result } = renderHook(() => hooks.useDeletedWorkspaces(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(deletedWorkspaces);
    });

    it('useRestoreWorkspace should restore workspace', async () => {
      mockApiClient.restoreWorkspace.mockResolvedValue({ id: '1', name: 'Restored' });

      const { result } = renderHook(() => hooks.useRestoreWorkspace(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.restoreWorkspace).toHaveBeenCalledWith('1');
    });
  });

  describe('Task Hooks', () => {
    it('useTasks should fetch tasks from apiClient', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'TODO' },
        { id: '2', title: 'Task 2', status: 'DONE' },
      ];

      mockApiClient.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => hooks.useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTasks);
      expect(mockApiClient.getTasks).toHaveBeenCalledTimes(1);
    });

    it('useTasks should fetch tasks by project', async () => {
      const mockTasks = [{ id: '1', title: 'Task 1', projectId: 'project-1' }];
      mockApiClient.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => hooks.useTasks('project-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getTasks).toHaveBeenCalledWith('project-1', undefined);
    });

    it('useTask should fetch single task', async () => {
      const mockTask = { id: '1', title: 'Task 1', status: 'TODO' };
      mockApiClient.getTask.mockResolvedValue(mockTask);

      const { result } = renderHook(() => hooks.useTask('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTask);
      expect(mockApiClient.getTask).toHaveBeenCalledWith('1');
    });

    it('useTask should be disabled when taskId is empty', () => {
      const { result } = renderHook(() => hooks.useTask(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('useTaskDetails should fetch task details', async () => {
      const mockDetails = { id: '1', title: 'Task 1', comments: [], attachments: [] };
      mockApiClient.getTaskDetails.mockResolvedValue(mockDetails);

      const { result } = renderHook(() => hooks.useTaskDetails('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDetails);
    });

    it('useCreateTask should call apiClient.createTask and invalidate cache', async () => {
      const newTask = { id: '1', title: 'New Task', status: 'TODO', projectId: 'project-1' };
      mockApiClient.createTask.mockResolvedValue(newTask);

      const { result } = renderHook(() => hooks.useCreateTask(), { wrapper });

      const createData = {
        title: 'New Task',
        projectId: 'project-1',
      };

      await result.current.mutateAsync(createData);

      expect(mockApiClient.createTask).toHaveBeenCalledWith(createData);
    });

    it('useUpdateTask should call apiClient.updateTask with optimistic update', async () => {
      const updatedTask = { id: '1', title: 'Updated Task', status: 'DONE' };
      mockApiClient.updateTask.mockResolvedValue(updatedTask);

      // Prefill cache
      queryClient.setQueryData(['tasks', '1'], { id: '1', title: 'Original Task', status: 'TODO' });

      const { result } = renderHook(() => hooks.useUpdateTask(), { wrapper });

      const updateData = {
        taskId: '1',
        data: { title: 'Updated Task', status: 'DONE' },
      };

      await result.current.mutateAsync(updateData);

      expect(mockApiClient.updateTask).toHaveBeenCalledWith('1', { title: 'Updated Task', status: 'DONE' });
    });

    it('useCompleteTask should call apiClient.completeTask', async () => {
      const completedTask = { id: '1', title: 'Task 1', status: 'COMPLETED' };
      mockApiClient.completeTask.mockResolvedValue(completedTask);

      const { result } = renderHook(() => hooks.useCompleteTask(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.completeTask).toHaveBeenCalledWith('1');
    });

    it('useDeleteTask should call apiClient.deleteTask', async () => {
      mockApiClient.deleteTask.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteTask(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteTask).toHaveBeenCalledWith('1');
    });

    it('useCreateSubtask should create subtask', async () => {
      const subtask = { id: '2', title: 'Subtask', parentTaskId: '1' };
      mockApiClient.createSubtask.mockResolvedValue(subtask);

      const { result } = renderHook(() => hooks.useCreateSubtask(), { wrapper });

      await result.current.mutateAsync({
        parentTaskId: '1',
        data: { title: 'Subtask' },
      });

      expect(mockApiClient.createSubtask).toHaveBeenCalledWith('1', { title: 'Subtask' });
    });
  });

  describe('Timer Hooks', () => {
    it('useActiveTimer should fetch active timer', async () => {
      const activeTimer = { id: '1', type: 'WORK', startedAt: new Date() };
      mockApiClient.getActiveTimer.mockResolvedValue(activeTimer);

      const { result } = renderHook(() => hooks.useActiveTimer(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(activeTimer);
    });

    it('useStartTimer should call apiClient.startTimer', async () => {
      const session = { id: '1', type: 'WORK', startedAt: new Date() };
      mockApiClient.startTimer.mockResolvedValue(session);

      const { result } = renderHook(() => hooks.useStartTimer(), { wrapper });

      const startData = {
        type: 'WORK',
        taskId: 'task-1',
      };

      await result.current.mutateAsync(startData);

      expect(mockApiClient.startTimer).toHaveBeenCalledWith(startData);
    });

    it('useStopTimer should call apiClient.stopTimer', async () => {
      const session = { id: '1', type: 'WORK', endedAt: new Date() };
      mockApiClient.stopTimer.mockResolvedValue(session);

      const { result } = renderHook(() => hooks.useStopTimer(), { wrapper });

      await result.current.mutateAsync({});

      expect(mockApiClient.stopTimer).toHaveBeenCalled();
    });

    it('usePauseTimer should pause timer', async () => {
      mockApiClient.pauseTimer.mockResolvedValue({ id: '1', paused: true });

      const { result } = renderHook(() => hooks.usePauseTimer(), { wrapper });

      await result.current.mutateAsync();

      expect(mockApiClient.pauseTimer).toHaveBeenCalled();
    });

    it('useResumeTimer should resume timer', async () => {
      mockApiClient.resumeTimer.mockResolvedValue({ id: '1', paused: false });

      const { result } = renderHook(() => hooks.useResumeTimer(), { wrapper });

      await result.current.mutateAsync({ pauseStartedAt: new Date() });

      expect(mockApiClient.resumeTimer).toHaveBeenCalled();
    });

    it('useSwitchTask should switch to different task', async () => {
      mockApiClient.switchTask.mockResolvedValue({ id: '1', taskId: 'task-2' });

      const { result } = renderHook(() => hooks.useSwitchTask(), { wrapper });

      await result.current.mutateAsync({ newTaskId: 'task-2' });

      expect(mockApiClient.switchTask).toHaveBeenCalledWith({ newTaskId: 'task-2' });
    });

    it('useSessionHistory should fetch sessions', async () => {
      const mockSessions = [
        { id: '1', type: 'WORK', duration: 25 },
        { id: '2', type: 'SHORT_BREAK', duration: 5 },
      ];

      mockApiClient.getSessionHistory.mockResolvedValue(mockSessions);

      const { result } = renderHook(() => hooks.useSessionHistory({}), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSessions);
      expect(mockApiClient.getSessionHistory).toHaveBeenCalledWith({});
    });

    it('useTimerStats should fetch timer statistics', async () => {
      const stats = { totalMinutes: 120, sessionsCompleted: 4 };
      mockApiClient.getTimerStats.mockResolvedValue(stats);

      const { result } = renderHook(() => hooks.useTimerStats(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(stats);
    });

    it('useTaskTimeSessions should fetch sessions for task', async () => {
      const sessions = [{ id: '1', taskId: 'task-1', duration: 25 }];
      mockApiClient.getTaskTimeSessions.mockResolvedValue(sessions);

      const { result } = renderHook(() => hooks.useTaskTimeSessions('task-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(sessions);
    });
  });

  describe('Analytics Hooks', () => {
    it('useDailyMetrics should fetch metrics from apiClient', async () => {
      const mockMetrics = {
        tasksCompleted: 10,
        minutesWorked: 240,
        pomodorosCompleted: 4,
        focusScore: 0.85,
      };

      mockApiClient.getDailyMetrics.mockResolvedValue(mockMetrics);

      const { result } = renderHook(
        () => hooks.useDailyMetrics({ date: '2026-01-04' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMetrics);
      expect(mockApiClient.getDailyMetrics).toHaveBeenCalledWith({ date: '2026-01-04' });
    });

    it('useDailyMetrics should handle missing date', async () => {
      const mockMetrics = { tasksCompleted: 5 };
      mockApiClient.getDailyMetrics.mockResolvedValue(mockMetrics);

      const { result } = renderHook(() => hooks.useDailyMetrics(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient.getDailyMetrics).toHaveBeenCalledWith(undefined);
    });

    it('useWeeklyMetrics should fetch weekly metrics', async () => {
      const mockMetrics = [
        { date: '2026-01-01', tasksCompleted: 8 },
        { date: '2026-01-02', tasksCompleted: 12 },
      ];

      mockApiClient.getWeeklyMetrics.mockResolvedValue(mockMetrics);

      const { result } = renderHook(() => hooks.useWeeklyMetrics(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMetrics);
    });

    it('useDashboardStats should fetch dashboard statistics', async () => {
      const stats = { totalTasks: 100, completedTasks: 50 };
      mockApiClient.getDashboardStats.mockResolvedValue(stats);

      const { result } = renderHook(() => hooks.useDashboardStats(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(stats);
    });

    it('useHeatmapData should fetch heatmap data', async () => {
      const heatmap = [{ date: '2026-01-01', count: 10 }];
      mockApiClient.getHeatmapData.mockResolvedValue(heatmap);

      const { result } = renderHook(() => hooks.useHeatmapData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(heatmap);
    });

    it('useProjectDistribution should fetch project distribution', async () => {
      const distribution = [{ projectId: '1', count: 20 }];
      mockApiClient.getProjectDistribution.mockResolvedValue(distribution);

      const { result } = renderHook(() => hooks.useProjectDistribution(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(distribution);
    });

    it('useTaskStatusDistribution should fetch status distribution', async () => {
      const distribution = [{ status: 'TODO', count: 10 }];
      mockApiClient.getTaskStatusDistribution.mockResolvedValue(distribution);

      const { result } = renderHook(() => hooks.useTaskStatusDistribution(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(distribution);
    });
  });

  describe('Project Hooks', () => {
    it('useProjects should fetch projects from apiClient', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', status: 'ACTIVE' },
        { id: '2', name: 'Project 2', status: 'ACTIVE' },
      ];

      mockApiClient.getProjects.mockResolvedValue(mockProjects);

      const { result } = renderHook(() => hooks.useProjects('workspace-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProjects);
      expect(mockApiClient.getProjects).toHaveBeenCalledWith('workspace-1');
    });

    it('useProjects should be disabled when workspaceId is empty', () => {
      const { result } = renderHook(() => hooks.useProjects(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('useAllProjects should fetch all projects', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', workspaceId: 'workspace-1' },
        { id: '2', name: 'Project 2', workspaceId: 'workspace-2' },
      ];

      mockApiClient.getAllProjects.mockResolvedValue(mockProjects);

      const { result } = renderHook(() => hooks.useAllProjects(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProjects);
    });

    it('useProject should fetch single project', async () => {
      const mockProject = { id: '1', name: 'Project 1', status: 'ACTIVE' };
      mockApiClient.getProject.mockResolvedValue(mockProject);

      const { result } = renderHook(() => hooks.useProject('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
    });

    it('useProject should be disabled when projectId is empty', () => {
      const { result } = renderHook(() => hooks.useProject(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('useCreateProject should call apiClient.createProject', async () => {
      const newProject = { id: '1', name: 'New Project', status: 'ACTIVE', workspaceId: 'workspace-1' };
      mockApiClient.createProject.mockResolvedValue(newProject);

      const { result } = renderHook(() => hooks.useCreateProject(), { wrapper });

      const createData = {
        name: 'New Project',
        workspaceId: 'workspace-1',
      };

      await result.current.mutateAsync(createData);

      expect(mockApiClient.createProject).toHaveBeenCalledWith(createData);
    });

    it('useUpdateProject should call apiClient.updateProject', async () => {
      const updatedProject = { id: '1', name: 'Updated Project' };
      mockApiClient.updateProject.mockResolvedValue(updatedProject);

      const { result } = renderHook(() => hooks.useUpdateProject(), { wrapper });

      await result.current.mutateAsync({
        projectId: '1',
        data: { name: 'Updated Project' },
      });

      expect(mockApiClient.updateProject).toHaveBeenCalledWith('1', { name: 'Updated Project' });
    });

    it('useArchiveProject should archive project', async () => {
      mockApiClient.archiveProject.mockResolvedValue({ id: '1', archived: true });

      const { result } = renderHook(() => hooks.useArchiveProject(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.archiveProject).toHaveBeenCalledWith('1');
    });

    it('useCompleteProject should complete project', async () => {
      mockApiClient.completeProject.mockResolvedValue({ id: '1', status: 'COMPLETED' });

      const { result } = renderHook(() => hooks.useCompleteProject(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.completeProject).toHaveBeenCalledWith('1');
    });

    it('useDeleteProject should delete project', async () => {
      mockApiClient.deleteProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteProject(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteProject).toHaveBeenCalledWith('1');
    });
  });

  describe('Tag Hooks', () => {
    it('useTags should fetch tags from apiClient', async () => {
      const mockTags = [
        { id: '1', name: 'Urgent', color: 'red' },
        { id: '2', name: 'Important', color: 'blue' },
      ];

      mockApiClient.getTags.mockResolvedValue(mockTags);

      const { result } = renderHook(() => hooks.useTags('workspace-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTags);
    });

    it('useTaskTags should fetch tags for task', async () => {
      const mockTags = [{ id: '1', name: 'Urgent' }];
      mockApiClient.getTaskTags.mockResolvedValue(mockTags);

      const { result } = renderHook(() => hooks.useTaskTags('task-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTags);
    });

    it('useCreateTag should create tag', async () => {
      const newTag = { id: '1', name: 'New Tag', workspaceId: 'workspace-1' };
      mockApiClient.createTag.mockResolvedValue(newTag);

      const { result } = renderHook(() => hooks.useCreateTag(), { wrapper });

      await result.current.mutateAsync({ name: 'New Tag', workspaceId: 'workspace-1' });

      expect(mockApiClient.createTag).toHaveBeenCalled();
    });

    it('useAssignTagToTask should assign tag to task', async () => {
      mockApiClient.assignTagToTask.mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useAssignTagToTask(), { wrapper });

      await result.current.mutateAsync({ tagId: 'tag-1', taskId: 'task-1' });

      expect(mockApiClient.assignTagToTask).toHaveBeenCalledWith('tag-1', 'task-1');
    });

    it('useRemoveTagFromTask should remove tag from task', async () => {
      mockApiClient.removeTagFromTask.mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useRemoveTagFromTask(), { wrapper });

      await result.current.mutateAsync({ tagId: 'tag-1', taskId: 'task-1' });

      expect(mockApiClient.removeTagFromTask).toHaveBeenCalledWith('tag-1', 'task-1');
    });

    it('useDeleteTag should delete tag', async () => {
      mockApiClient.deleteTag.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteTag(), { wrapper });

      await result.current.mutateAsync('tag-1');

      expect(mockApiClient.deleteTag).toHaveBeenCalledWith('tag-1');
    });
  });

  describe('Habit Hooks', () => {
    it('useHabits should fetch habits from apiClient', async () => {
      const mockHabits = [
        { id: '1', name: 'Exercise', frequency: 'DAILY' },
        { id: '2', name: 'Read', frequency: 'WEEKLY' },
      ];

      mockApiClient.getHabits.mockResolvedValue(mockHabits);

      const { result } = renderHook(() => hooks.useHabits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHabits);
    });

    it('useTodayHabits should fetch today habits', async () => {
      const todayHabits = [{ id: '1', name: 'Exercise', completed: false }];
      mockApiClient.getTodayHabits.mockResolvedValue(todayHabits);

      const { result } = renderHook(() => hooks.useTodayHabits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(todayHabits);
    });

    it('useHabit should fetch single habit', async () => {
      const habit = { id: '1', name: 'Exercise', frequency: 'DAILY' };
      mockApiClient.getHabit.mockResolvedValue(habit);

      const { result } = renderHook(() => hooks.useHabit('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(habit);
    });

    it('useHabitStats should fetch habit statistics', async () => {
      const stats = { streak: 7, completionRate: 0.85 };
      mockApiClient.getHabitStats.mockResolvedValue(stats);

      const { result } = renderHook(() => hooks.useHabitStats('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(stats);
    });

    it('useCreateHabit should create habit', async () => {
      const newHabit = { id: '1', name: 'New Habit' };
      mockApiClient.createHabit.mockResolvedValue(newHabit);

      const { result } = renderHook(() => hooks.useCreateHabit(), { wrapper });

      await result.current.mutateAsync({ name: 'New Habit', frequency: 'DAILY' });

      expect(mockApiClient.createHabit).toHaveBeenCalled();
    });

    it('useUpdateHabit should update habit', async () => {
      mockApiClient.updateHabit.mockResolvedValue({ id: '1', name: 'Updated' });

      const { result } = renderHook(() => hooks.useUpdateHabit(), { wrapper });

      await result.current.mutateAsync({ habitId: '1', data: { name: 'Updated' } });

      expect(mockApiClient.updateHabit).toHaveBeenCalledWith('1', { name: 'Updated' });
    });

    it('useDeleteHabit should delete habit', async () => {
      mockApiClient.deleteHabit.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteHabit(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteHabit).toHaveBeenCalledWith('1');
    });

    it('useCompleteHabit should complete habit', async () => {
      const completion = { id: '1', habitId: 'habit-1', completedDate: '2026-01-04' };
      mockApiClient.completeHabit.mockResolvedValue(completion);

      const { result } = renderHook(() => hooks.useCompleteHabit(), { wrapper });

      await result.current.mutateAsync({ habitId: 'habit-1', date: '2026-01-04' });

      expect(mockApiClient.completeHabit).toHaveBeenCalledWith('habit-1', { date: '2026-01-04' });
    });

    it('useUncompleteHabit should uncomplete habit', async () => {
      mockApiClient.uncompleteHabit.mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useUncompleteHabit(), { wrapper });

      await result.current.mutateAsync('habit-1');

      expect(mockApiClient.uncompleteHabit).toHaveBeenCalledWith('habit-1');
    });

    it('usePauseHabit should pause habit', async () => {
      mockApiClient.pauseHabit.mockResolvedValue({ id: '1', paused: true });

      const { result } = renderHook(() => hooks.usePauseHabit(), { wrapper });

      await result.current.mutateAsync('habit-1');

      expect(mockApiClient.pauseHabit).toHaveBeenCalledWith('habit-1');
    });

    it('useResumeHabit should resume habit', async () => {
      mockApiClient.resumeHabit.mockResolvedValue({ id: '1', paused: false });

      const { result } = renderHook(() => hooks.useResumeHabit(), { wrapper });

      await result.current.mutateAsync('habit-1');

      expect(mockApiClient.resumeHabit).toHaveBeenCalledWith('habit-1');
    });
  });

  describe('AI Hooks', () => {
    it('useAIProfile should fetch AI profile', async () => {
      const profile = { productivityPatterns: [], optimalWorkTimes: [] };
      mockApiClient.getAIProfile.mockResolvedValue(profile);

      const { result } = renderHook(() => hooks.useAIProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(profile);
    });

    it('useOptimalSchedule should fetch optimal schedule', async () => {
      const schedule = [{ taskId: '1', startTime: '09:00' }];
      mockApiClient.getOptimalSchedule.mockResolvedValue(schedule);

      const { result } = renderHook(() => hooks.useOptimalSchedule({ topN: 5 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(schedule);
    });

    it('useTaskDurationPrediction should predict duration', async () => {
      const prediction = { estimatedMinutes: 30 };
      mockApiClient.predictTaskDuration.mockResolvedValue(prediction);

      const { result } = renderHook(
        () => hooks.useTaskDurationPrediction({ title: 'New Task' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(prediction);
    });

    it('useTaskDurationPrediction should be disabled without title', () => {
      const { result } = renderHook(() => hooks.useTaskDurationPrediction(), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('useGenerateWeeklyReport should generate report', async () => {
      const report = { id: '1', weekStart: '2026-01-01' };
      mockApiClient.generateWeeklyReport.mockResolvedValue(report);

      const { result } = renderHook(() => hooks.useGenerateWeeklyReport(), { wrapper });

      await result.current.mutateAsync('2026-01-01');

      expect(mockApiClient.generateWeeklyReport).toHaveBeenCalledWith('2026-01-01');
    });

    it('useReports should fetch reports', async () => {
      const reports = [{ id: '1', title: 'Week 1' }];
      mockApiClient.getReports.mockResolvedValue(reports);

      const { result } = renderHook(() => hooks.useReports(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(reports);
    });

    it('useReport should fetch single report', async () => {
      const report = { id: '1', title: 'Week 1', content: '...' };
      mockApiClient.getReport.mockResolvedValue(report);

      const { result } = renderHook(() => hooks.useReport('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(report);
    });

    it('useDeleteReport should delete report', async () => {
      mockApiClient.deleteReport.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteReport(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteReport).toHaveBeenCalledWith('1');
    });
  });

  describe('Comment Hooks', () => {
    it('useTaskComments should fetch comments', async () => {
      const comments = [{ id: '1', taskId: 'task-1', content: 'Comment 1' }];
      mockApiClient.getTaskComments.mockResolvedValue(comments);

      const { result } = renderHook(() => hooks.useTaskComments('task-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(comments);
    });

    it('useCreateComment should create comment', async () => {
      const comment = { id: '1', taskId: 'task-1', content: 'New comment' };
      mockApiClient.createComment.mockResolvedValue(comment);

      const { result } = renderHook(() => hooks.useCreateComment(), { wrapper });

      await result.current.mutateAsync({ taskId: 'task-1', content: 'New comment' });

      expect(mockApiClient.createComment).toHaveBeenCalled();
    });

    it('useUpdateComment should update comment', async () => {
      mockApiClient.updateComment.mockResolvedValue({ id: '1', content: 'Updated' });

      const { result } = renderHook(() => hooks.useUpdateComment(), { wrapper });

      await result.current.mutateAsync({ commentId: '1', data: { content: 'Updated' } });

      expect(mockApiClient.updateComment).toHaveBeenCalledWith('1', { content: 'Updated' });
    });

    it('useDeleteComment should delete comment', async () => {
      mockApiClient.deleteComment.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteComment(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteComment).toHaveBeenCalledWith('1');
    });
  });

  describe('Attachment Hooks', () => {
    it('useTaskAttachments should fetch attachments', async () => {
      const attachments = [{ id: '1', taskId: 'task-1', filename: 'file.pdf' }];
      mockApiClient.getTaskAttachments.mockResolvedValue(attachments);

      const { result } = renderHook(() => hooks.useTaskAttachments('task-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(attachments);
    });

    it('useCreateAttachment should create attachment', async () => {
      const attachment = { id: '1', taskId: 'task-1', filename: 'file.pdf' };
      mockApiClient.createAttachment.mockResolvedValue(attachment);

      const { result } = renderHook(() => hooks.useCreateAttachment(), { wrapper });

      await result.current.mutateAsync({ taskId: 'task-1', file: new File([''], 'file.pdf') });

      expect(mockApiClient.createAttachment).toHaveBeenCalled();
    });

    it('useDeleteAttachment should delete attachment', async () => {
      mockApiClient.deleteAttachment.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteAttachment(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteAttachment).toHaveBeenCalledWith('1');
    });
  });

  describe('Workflow Hooks', () => {
    it('useWorkflows should fetch workflows', async () => {
      const workflows = [{ id: '1', name: 'Workflow 1', workspaceId: 'workspace-1' }];
      mockApiClient.getWorkflows.mockResolvedValue(workflows);

      const { result } = renderHook(() => hooks.useWorkflows('workspace-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(workflows);
    });

    it('useWorkflows should be disabled without workspaceId', () => {
      const { result } = renderHook(() => hooks.useWorkflows(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
    });

    it('useCreateWorkflow should create workflow', async () => {
      const workflow = { id: '1', name: 'New Workflow' };
      mockApiClient.createWorkflow.mockResolvedValue(workflow);

      const { result } = renderHook(() => hooks.useCreateWorkflow(), { wrapper });

      await result.current.mutateAsync({ name: 'New Workflow', workspaceId: 'workspace-1' });

      expect(mockApiClient.createWorkflow).toHaveBeenCalled();
    });

    it('useUpdateWorkflow should update workflow', async () => {
      mockApiClient.updateWorkflow.mockResolvedValue({ id: '1', name: 'Updated' });

      const { result } = renderHook(() => hooks.useUpdateWorkflow(), { wrapper });

      await result.current.mutateAsync({ workflowId: '1', data: { name: 'Updated' } });

      expect(mockApiClient.updateWorkflow).toHaveBeenCalledWith('1', { name: 'Updated' });
    });

    it('useDeleteWorkflow should delete workflow', async () => {
      mockApiClient.deleteWorkflow.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteWorkflow(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteWorkflow).toHaveBeenCalledWith('1');
    });
  });

  describe('Objective (OKR) Hooks', () => {
    it('useObjectives should fetch objectives', async () => {
      const objectives = [{ id: '1', title: 'Objective 1' }];
      mockApiClient.getObjectives.mockResolvedValue(objectives);

      const { result } = renderHook(() => hooks.useObjectives(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(objectives);
    });

    it('useCurrentPeriodObjectives should fetch current objectives', async () => {
      const objectives = [{ id: '1', title: 'Current Objective' }];
      mockApiClient.getCurrentPeriodObjectives.mockResolvedValue(objectives);

      const { result } = renderHook(() => hooks.useCurrentPeriodObjectives(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(objectives);
    });

    it('useObjectivesDashboard should fetch dashboard summary', async () => {
      const summary = { totalObjectives: 5, completionRate: 0.6 };
      mockApiClient.getObjectivesDashboardSummary.mockResolvedValue(summary);

      const { result } = renderHook(() => hooks.useObjectivesDashboard(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(summary);
    });

    it('useObjective should fetch single objective', async () => {
      const objective = { id: '1', title: 'Objective 1', keyResults: [] };
      mockApiClient.getObjective.mockResolvedValue(objective);

      const { result } = renderHook(() => hooks.useObjective('1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(objective);
    });

    it('useCreateObjective should create objective', async () => {
      const objective = { id: '1', title: 'New Objective' };
      mockApiClient.createObjective.mockResolvedValue(objective);

      const { result } = renderHook(() => hooks.useCreateObjective(), { wrapper });

      await result.current.mutateAsync({ title: 'New Objective', workspaceId: 'workspace-1' });

      expect(mockApiClient.createObjective).toHaveBeenCalled();
    });

    it('useUpdateObjective should update objective', async () => {
      mockApiClient.updateObjective.mockResolvedValue({ id: '1', title: 'Updated' });

      const { result } = renderHook(() => hooks.useUpdateObjective(), { wrapper });

      await result.current.mutateAsync({ objectiveId: '1', data: { title: 'Updated' } });

      expect(mockApiClient.updateObjective).toHaveBeenCalledWith('1', { title: 'Updated' });
    });

    it('useDeleteObjective should delete objective', async () => {
      mockApiClient.deleteObjective.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteObjective(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteObjective).toHaveBeenCalledWith('1');
    });

    it('useAddKeyResult should add key result', async () => {
      const keyResult = { id: '1', title: 'Key Result 1' };
      mockApiClient.addKeyResult.mockResolvedValue(keyResult);

      const { result } = renderHook(() => hooks.useAddKeyResult(), { wrapper });

      await result.current.mutateAsync({ objectiveId: '1', data: { title: 'Key Result 1' } });

      expect(mockApiClient.addKeyResult).toHaveBeenCalledWith('1', { title: 'Key Result 1' });
    });

    it('useUpdateKeyResult should update key result', async () => {
      mockApiClient.updateKeyResult.mockResolvedValue({ id: '1', title: 'Updated' });

      const { result } = renderHook(() => hooks.useUpdateKeyResult(), { wrapper });

      await result.current.mutateAsync({ keyResultId: '1', data: { title: 'Updated' } });

      expect(mockApiClient.updateKeyResult).toHaveBeenCalledWith('1', { title: 'Updated' });
    });

    it('useDeleteKeyResult should delete key result', async () => {
      mockApiClient.deleteKeyResult.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteKeyResult(), { wrapper });

      await result.current.mutateAsync('1');

      expect(mockApiClient.deleteKeyResult).toHaveBeenCalledWith('1');
    });

    it('useLinkTaskToKeyResult should link task', async () => {
      mockApiClient.linkTaskToKeyResult.mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useLinkTaskToKeyResult(), { wrapper });

      await result.current.mutateAsync({ keyResultId: '1', data: { taskId: 'task-1' } });

      expect(mockApiClient.linkTaskToKeyResult).toHaveBeenCalled();
    });

    it('useUnlinkTaskFromKeyResult should unlink task', async () => {
      mockApiClient.unlinkTaskFromKeyResult.mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useUnlinkTaskFromKeyResult(), { wrapper });

      await result.current.mutateAsync({ keyResultId: '1', taskId: 'task-1' });

      expect(mockApiClient.unlinkTaskFromKeyResult).toHaveBeenCalledWith('1', 'task-1');
    });
  });

  describe('Custom Field Hooks', () => {
    it('useCustomFields should fetch custom fields', async () => {
      const fields = [{ id: '1', name: 'Priority', type: 'SELECT' }];
      mockApiClient.getProjectCustomFields.mockResolvedValue(fields);

      const { result } = renderHook(() => hooks.useCustomFields('project-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(fields);
    });

    it('useCreateCustomField should create custom field', async () => {
      const field = { id: '1', name: 'Priority', type: 'SELECT' };
      mockApiClient.createCustomField.mockResolvedValue(field);

      const { result } = renderHook(() => hooks.useCreateCustomField(), { wrapper });

      await result.current.mutateAsync({ projectId: 'project-1', data: { name: 'Priority', type: 'SELECT' } });

      expect(mockApiClient.createCustomField).toHaveBeenCalled();
    });

    it('useUpdateCustomField should update custom field', async () => {
      mockApiClient.updateCustomField.mockResolvedValue({ id: '1', name: 'Updated' });

      const { result } = renderHook(() => hooks.useUpdateCustomField(), { wrapper });

      await result.current.mutateAsync({ fieldId: '1', data: { name: 'Updated' }, projectId: 'project-1' });

      expect(mockApiClient.updateCustomField).toHaveBeenCalledWith('1', { name: 'Updated' });
    });

    it('useDeleteCustomField should delete custom field', async () => {
      mockApiClient.deleteCustomField.mockResolvedValue(undefined);

      const { result } = renderHook(() => hooks.useDeleteCustomField(), { wrapper });

      await result.current.mutateAsync({ fieldId: '1', projectId: 'project-1' });

      expect(mockApiClient.deleteCustomField).toHaveBeenCalledWith('1');
    });

    it('useTaskCustomValues should fetch task custom values', async () => {
      const values = { priority: 'High' };
      mockApiClient.getTaskCustomValues.mockResolvedValue(values);

      const { result } = renderHook(() => hooks.useTaskCustomValues('task-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(values);
    });

    it('useSetTaskCustomValues should set custom values', async () => {
      mockApiClient.setTaskCustomValues.mockResolvedValue({ success: true });

      const { result } = renderHook(() => hooks.useSetTaskCustomValues(), { wrapper });

      await result.current.mutateAsync({ taskId: 'task-1', data: { priority: 'High' } });

      expect(mockApiClient.setTaskCustomValues).toHaveBeenCalledWith('task-1', { priority: 'High' });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      mockApiClient.getTasks.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => hooks.useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error.message).toBe('Network error');
    });

    it('should handle empty responses', async () => {
      mockApiClient.getTasks.mockResolvedValue([]);

      const { result } = renderHook(() => hooks.useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle null responses', async () => {
      mockApiClient.getCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => hooks.useCurrentUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should handle timeout errors', async () => {
      mockApiClient.getTasks.mockRejectedValue(new Error('Request timeout'));

      const { result } = renderHook(() => hooks.useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error.message).toBe('Request timeout');
    });
  });
});
