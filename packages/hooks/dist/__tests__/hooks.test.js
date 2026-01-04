"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const react_1 = require("@testing-library/react");
const react_query_1 = require("@tanstack/react-query");
const hooks_1 = require("../hooks");
// Mock API client
const mockApiClient = {
    // Auth
    register: vitest_1.vi.fn(),
    login: vitest_1.vi.fn(),
    logout: vitest_1.vi.fn(),
    getCurrentUser: vitest_1.vi.fn(),
    // User
    updateProfile: vitest_1.vi.fn(),
    deleteAccount: vitest_1.vi.fn(),
    exportData: vitest_1.vi.fn(),
    getFullProfile: vitest_1.vi.fn(),
    getPreferences: vitest_1.vi.fn(),
    updatePreferences: vitest_1.vi.fn(),
    getIntegrations: vitest_1.vi.fn(),
    // Workspaces
    getWorkspaces: vitest_1.vi.fn(),
    getWorkspace: vitest_1.vi.fn(),
    getWorkspaceBySlug: vitest_1.vi.fn(),
    createWorkspace: vitest_1.vi.fn(),
    updateWorkspace: vitest_1.vi.fn(),
    deleteWorkspace: vitest_1.vi.fn(),
    getDeletedWorkspaces: vitest_1.vi.fn(),
    restoreWorkspace: vitest_1.vi.fn(),
    permanentDeleteWorkspace: vitest_1.vi.fn(),
    addWorkspaceMember: vitest_1.vi.fn(),
    removeWorkspaceMember: vitest_1.vi.fn(),
    getWorkspaceMembers: vitest_1.vi.fn(),
    getWorkspaceInvitations: vitest_1.vi.fn(),
    inviteWorkspaceMember: vitest_1.vi.fn(),
    acceptWorkspaceInvitation: vitest_1.vi.fn(),
    getWorkspaceSettings: vitest_1.vi.fn(),
    updateWorkspaceSettings: vitest_1.vi.fn(),
    getWorkspaceAuditLogs: vitest_1.vi.fn(),
    createAuditLog: vitest_1.vi.fn(),
    archiveWorkspace: vitest_1.vi.fn(),
    // Workflows
    getWorkflows: vitest_1.vi.fn(),
    createWorkflow: vitest_1.vi.fn(),
    updateWorkflow: vitest_1.vi.fn(),
    deleteWorkflow: vitest_1.vi.fn(),
    // Tasks
    getTasks: vitest_1.vi.fn(),
    getTask: vitest_1.vi.fn(),
    getTaskDetails: vitest_1.vi.fn(),
    createTask: vitest_1.vi.fn(),
    updateTask: vitest_1.vi.fn(),
    completeTask: vitest_1.vi.fn(),
    deleteTask: vitest_1.vi.fn(),
    createSubtask: vitest_1.vi.fn(),
    generatePublicToken: vitest_1.vi.fn(),
    getTaskByPublicToken: vitest_1.vi.fn(),
    // Projects
    getProjects: vitest_1.vi.fn(),
    getAllProjects: vitest_1.vi.fn(),
    getProject: vitest_1.vi.fn(),
    getProjectBySlugs: vitest_1.vi.fn(),
    createProject: vitest_1.vi.fn(),
    updateProject: vitest_1.vi.fn(),
    archiveProject: vitest_1.vi.fn(),
    completeProject: vitest_1.vi.fn(),
    deleteProject: vitest_1.vi.fn(),
    // Tags
    getTags: vitest_1.vi.fn(),
    getTaskTags: vitest_1.vi.fn(),
    createTag: vitest_1.vi.fn(),
    assignTagToTask: vitest_1.vi.fn(),
    removeTagFromTask: vitest_1.vi.fn(),
    deleteTag: vitest_1.vi.fn(),
    updateTag: vitest_1.vi.fn(),
    // Timer
    startTimer: vitest_1.vi.fn(),
    stopTimer: vitest_1.vi.fn(),
    getActiveTimer: vitest_1.vi.fn(),
    pauseTimer: vitest_1.vi.fn(),
    resumeTimer: vitest_1.vi.fn(),
    switchTask: vitest_1.vi.fn(),
    getSessionHistory: vitest_1.vi.fn(),
    getTimerStats: vitest_1.vi.fn(),
    getTaskTimeSessions: vitest_1.vi.fn(),
    // Analytics
    getDailyMetrics: vitest_1.vi.fn(),
    getWeeklyMetrics: vitest_1.vi.fn(),
    getDashboardStats: vitest_1.vi.fn(),
    getHeatmapData: vitest_1.vi.fn(),
    getProjectDistribution: vitest_1.vi.fn(),
    getTaskStatusDistribution: vitest_1.vi.fn(),
    getMonthlyMetrics: vitest_1.vi.fn(),
    getDateRangeMetrics: vitest_1.vi.fn(),
    // AI
    getAIProfile: vitest_1.vi.fn(),
    getOptimalSchedule: vitest_1.vi.fn(),
    predictTaskDuration: vitest_1.vi.fn(),
    generateWeeklyReport: vitest_1.vi.fn(),
    getReports: vitest_1.vi.fn(),
    getReport: vitest_1.vi.fn(),
    deleteReport: vitest_1.vi.fn(),
    // Habits
    getHabits: vitest_1.vi.fn(),
    getTodayHabits: vitest_1.vi.fn(),
    getHabit: vitest_1.vi.fn(),
    getHabitStats: vitest_1.vi.fn(),
    createHabit: vitest_1.vi.fn(),
    updateHabit: vitest_1.vi.fn(),
    deleteHabit: vitest_1.vi.fn(),
    completeHabit: vitest_1.vi.fn(),
    uncompleteHabit: vitest_1.vi.fn(),
    pauseHabit: vitest_1.vi.fn(),
    resumeHabit: vitest_1.vi.fn(),
    // Objectives
    getObjectives: vitest_1.vi.fn(),
    getCurrentPeriodObjectives: vitest_1.vi.fn(),
    getObjectivesDashboardSummary: vitest_1.vi.fn(),
    getObjective: vitest_1.vi.fn(),
    createObjective: vitest_1.vi.fn(),
    updateObjective: vitest_1.vi.fn(),
    deleteObjective: vitest_1.vi.fn(),
    addKeyResult: vitest_1.vi.fn(),
    updateKeyResult: vitest_1.vi.fn(),
    deleteKeyResult: vitest_1.vi.fn(),
    linkTaskToKeyResult: vitest_1.vi.fn(),
    unlinkTaskFromKeyResult: vitest_1.vi.fn(),
    // Comments
    getTaskComments: vitest_1.vi.fn(),
    createComment: vitest_1.vi.fn(),
    updateComment: vitest_1.vi.fn(),
    deleteComment: vitest_1.vi.fn(),
    // Attachments
    getTaskAttachments: vitest_1.vi.fn(),
    createAttachment: vitest_1.vi.fn(),
    deleteAttachment: vitest_1.vi.fn(),
    getProjectAttachments: vitest_1.vi.fn(),
    // Notifications
    getNotifications: vitest_1.vi.fn(),
    getUnreadNotificationsCount: vitest_1.vi.fn(),
    markNotificationAsRead: vitest_1.vi.fn(),
    markAllNotificationsAsRead: vitest_1.vi.fn(),
    // Custom Fields
    getProjectCustomFields: vitest_1.vi.fn(),
    createCustomField: vitest_1.vi.fn(),
    updateCustomField: vitest_1.vi.fn(),
    deleteCustomField: vitest_1.vi.fn(),
    getTaskCustomValues: vitest_1.vi.fn(),
    setTaskCustomValues: vitest_1.vi.fn(),
    // Time Blocks
    getTimeBlocks: vitest_1.vi.fn(),
};
(0, vitest_1.describe)('createHooks', () => {
    let queryClient;
    let hooks;
    (0, vitest_1.beforeEach)(() => {
        queryClient = new react_query_1.QueryClient({
            defaultOptions: {
                queries: { retry: false, gcTime: 0 },
                mutations: { retry: false },
            },
            logger: {
                log: console.log,
                warn: console.warn,
                error: () => { }, // Suppress error logs in tests
            },
        });
        const config = {
            apiClient: mockApiClient,
        };
        hooks = (0, hooks_1.createHooks)(config);
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        queryClient.clear();
        (0, react_1.cleanup)();
    });
    afterAll(() => {
        // Ensure complete cleanup after all tests
        (0, react_1.cleanup)();
    });
    const wrapper = ({ children }) => client = { queryClient } > { children } < /QueryClientProvider>;
});
(0, vitest_1.describe)('Factory Pattern', () => {
    (0, vitest_1.it)('should create all auth hooks', () => {
        (0, vitest_1.expect)(hooks.useRegister).toBeDefined();
        (0, vitest_1.expect)(hooks.useLogin).toBeDefined();
        (0, vitest_1.expect)(hooks.useLogout).toBeDefined();
    });
    (0, vitest_1.it)('should create all user hooks', () => {
        (0, vitest_1.expect)(hooks.useCurrentUser).toBeDefined();
        (0, vitest_1.expect)(hooks.useUpdateProfile).toBeDefined();
        (0, vitest_1.expect)(hooks.useFullProfile).toBeDefined();
        (0, vitest_1.expect)(hooks.useUserPreferences).toBeDefined();
        (0, vitest_1.expect)(hooks.useUpdatePreferences).toBeDefined();
        (0, vitest_1.expect)(hooks.useUserIntegrations).toBeDefined();
        (0, vitest_1.expect)(hooks.useExportData).toBeDefined();
        (0, vitest_1.expect)(hooks.useDeleteAccount).toBeDefined();
    });
    (0, vitest_1.it)('should create all workspace hooks', () => {
        (0, vitest_1.expect)(hooks.useWorkspaces).toBeDefined();
        (0, vitest_1.expect)(hooks.useWorkspace).toBeDefined();
        (0, vitest_1.expect)(hooks.useWorkspaceBySlug).toBeDefined();
        (0, vitest_1.expect)(hooks.useCreateWorkspace).toBeDefined();
        (0, vitest_1.expect)(hooks.useUpdateWorkspace).toBeDefined();
        (0, vitest_1.expect)(hooks.useDeleteWorkspace).toBeDefined();
    });
    (0, vitest_1.it)('should create all task hooks', () => {
        (0, vitest_1.expect)(hooks.useTasks).toBeDefined();
        (0, vitest_1.expect)(hooks.useTask).toBeDefined();
        (0, vitest_1.expect)(hooks.useTaskDetails).toBeDefined();
        (0, vitest_1.expect)(hooks.useCreateTask).toBeDefined();
        (0, vitest_1.expect)(hooks.useUpdateTask).toBeDefined();
        (0, vitest_1.expect)(hooks.useCompleteTask).toBeDefined();
        (0, vitest_1.expect)(hooks.useDeleteTask).toBeDefined();
    });
    (0, vitest_1.it)('should create all timer hooks', () => {
        (0, vitest_1.expect)(hooks.useActiveTimer).toBeDefined();
        (0, vitest_1.expect)(hooks.useStartTimer).toBeDefined();
        (0, vitest_1.expect)(hooks.useStopTimer).toBeDefined();
        (0, vitest_1.expect)(hooks.usePauseTimer).toBeDefined();
        (0, vitest_1.expect)(hooks.useResumeTimer).toBeDefined();
        (0, vitest_1.expect)(hooks.useSwitchTask).toBeDefined();
    });
    (0, vitest_1.it)('should bind apiClient to all hooks', async () => {
        mockApiClient.getTasks.mockResolvedValue([
            { id: '1', title: 'Task 1' },
            { id: '2', title: 'Task 2' },
        ]);
        const { result } = (0, react_1.renderHook)(() => hooks.useTasks(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(mockApiClient.getTasks).toHaveBeenCalledTimes(1);
    });
});
(0, vitest_1.describe)('Auth Hooks', () => {
    (0, vitest_1.it)('useRegister should call apiClient.register', async () => {
        mockApiClient.register.mockResolvedValue({ id: '1', email: 'test@test.com' });
        const { result } = (0, react_1.renderHook)(() => hooks.useRegister(), { wrapper });
        const registerData = {
            email: 'test@test.com',
            password: 'password123',
            name: 'Test User',
        };
        await result.current.mutateAsync(registerData);
        (0, vitest_1.expect)(mockApiClient.register).toHaveBeenCalledWith(registerData);
        (0, vitest_1.expect)(mockApiClient.register).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('useRegister should handle errors', async () => {
        mockApiClient.register.mockRejectedValue(new Error('Registration failed'));
        const { result } = (0, react_1.renderHook)(() => hooks.useRegister(), { wrapper });
        await (0, vitest_1.expect)(result.current.mutateAsync({ email: 'test@test.com', password: 'pass', name: 'Test' }))
            .rejects.toThrow('Registration failed');
    });
    (0, vitest_1.it)('useLogin should call apiClient.login', async () => {
        mockApiClient.login.mockResolvedValue({
            user: { id: '1', email: 'test@test.com' },
            token: 'jwt-token',
        });
        const { result } = (0, react_1.renderHook)(() => hooks.useLogin(), { wrapper });
        const loginData = {
            email: 'test@test.com',
            password: 'password123',
        };
        await result.current.mutateAsync(loginData);
        (0, vitest_1.expect)(mockApiClient.login).toHaveBeenCalledWith(loginData);
        (0, vitest_1.expect)(mockApiClient.login).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('useLogin should handle authentication errors', async () => {
        mockApiClient.login.mockRejectedValue(new Error('Invalid credentials'));
        const { result } = (0, react_1.renderHook)(() => hooks.useLogin(), { wrapper });
        await (0, vitest_1.expect)(result.current.mutateAsync({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
    });
    (0, vitest_1.it)('useLogout should call apiClient.logout and clear query cache', async () => {
        mockApiClient.logout.mockResolvedValue(undefined);
        queryClient.setQueryData(['tasks'], [{ id: '1', title: 'Task 1' }]);
        const { result } = (0, react_1.renderHook)(() => hooks.useLogout(), { wrapper });
        await result.current.mutateAsync();
        (0, vitest_1.expect)(mockApiClient.logout).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(queryClient.getQueryData(['tasks'])).toBeNull();
    });
});
(0, vitest_1.describe)('User Hooks', () => {
    (0, vitest_1.it)('useCurrentUser should fetch current user', async () => {
        const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };
        mockApiClient.getCurrentUser.mockResolvedValue(mockUser);
        const { result } = (0, react_1.renderHook)(() => hooks.useCurrentUser(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockUser);
        (0, vitest_1.expect)(mockApiClient.getCurrentUser).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('useCurrentUser should handle not authenticated', async () => {
        mockApiClient.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
        const { result } = (0, react_1.renderHook)(() => hooks.useCurrentUser(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isError).toBe(true);
        });
        (0, vitest_1.expect)(result.current.error).toBeDefined();
    });
    (0, vitest_1.it)('useUpdateProfile should call apiClient.updateProfile and invalidate cache', async () => {
        const updatedUser = { id: '1', name: 'Updated Name' };
        mockApiClient.updateProfile.mockResolvedValue(updatedUser);
        queryClient.setQueryData(['user', 'current'], { id: '1', name: 'Old Name' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateProfile(), { wrapper });
        await result.current.mutateAsync({ name: 'Updated Name' });
        (0, vitest_1.expect)(mockApiClient.updateProfile).toHaveBeenCalledWith({ name: 'Updated Name' });
    });
    (0, vitest_1.it)('useFullProfile should fetch full profile', async () => {
        const mockProfile = { id: '1', email: 'test@test.com', preferences: {} };
        mockApiClient.getFullProfile.mockResolvedValue(mockProfile);
        const { result } = (0, react_1.renderHook)(() => hooks.useFullProfile(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockProfile);
    });
    (0, vitest_1.it)('useUserPreferences should fetch preferences', async () => {
        const mockPrefs = { theme: 'dark', language: 'en' };
        mockApiClient.getPreferences.mockResolvedValue(mockPrefs);
        const { result } = (0, react_1.renderHook)(() => hooks.useUserPreferences(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockPrefs);
    });
    (0, vitest_1.it)('useUpdatePreferences should update preferences', async () => {
        mockApiClient.updatePreferences.mockResolvedValue({ theme: 'light' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdatePreferences(), { wrapper });
        await result.current.mutateAsync({ theme: 'light' });
        (0, vitest_1.expect)(mockApiClient.updatePreferences).toHaveBeenCalledWith({ theme: 'light' });
    });
});
(0, vitest_1.describe)('Workspace Hooks', () => {
    (0, vitest_1.it)('useWorkspaces should fetch workspaces from apiClient', async () => {
        const mockWorkspaces = [
            { id: '1', name: 'Personal', type: 'PERSONAL' },
            { id: '2', name: 'Work', type: 'WORK' },
        ];
        mockApiClient.getWorkspaces.mockResolvedValue(mockWorkspaces);
        const { result } = (0, react_1.renderHook)(() => hooks.useWorkspaces(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockWorkspaces);
        (0, vitest_1.expect)(mockApiClient.getWorkspaces).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('useWorkspaces should handle empty list', async () => {
        mockApiClient.getWorkspaces.mockResolvedValue([]);
        const { result } = (0, react_1.renderHook)(() => hooks.useWorkspaces(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual([]);
    });
    (0, vitest_1.it)('useWorkspace should fetch single workspace', async () => {
        const mockWorkspace = { id: '1', name: 'Personal', type: 'PERSONAL' };
        mockApiClient.getWorkspace.mockResolvedValue(mockWorkspace);
        const { result } = (0, react_1.renderHook)(() => hooks.useWorkspace('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockWorkspace);
        (0, vitest_1.expect)(mockApiClient.getWorkspace).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useWorkspace should be disabled when workspaceId is empty', () => {
        const { result } = (0, react_1.renderHook)(() => hooks.useWorkspace(''), { wrapper });
        (0, vitest_1.expect)(result.current.fetchStatus).toBe('idle');
    });
    (0, vitest_1.it)('useCreateWorkspace should call apiClient.createWorkspace and invalidate cache', async () => {
        const newWorkspace = { id: '1', name: 'New Workspace', type: 'PERSONAL' };
        mockApiClient.createWorkspace.mockResolvedValue(newWorkspace);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateWorkspace(), { wrapper });
        const createData = {
            name: 'New Workspace',
            type: 'PERSONAL',
        };
        await result.current.mutateAsync(createData);
        (0, vitest_1.expect)(mockApiClient.createWorkspace).toHaveBeenCalledWith(createData);
    });
    (0, vitest_1.it)('useUpdateWorkspace should call apiClient.updateWorkspace', async () => {
        const updatedWorkspace = { id: '1', name: 'Updated Workspace' };
        mockApiClient.updateWorkspace.mockResolvedValue(updatedWorkspace);
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateWorkspace(), { wrapper });
        await result.current.mutateAsync({
            workspaceId: '1',
            data: { name: 'Updated Workspace' },
        });
        (0, vitest_1.expect)(mockApiClient.updateWorkspace).toHaveBeenCalledWith('1', { name: 'Updated Workspace' });
    });
    (0, vitest_1.it)('useDeleteWorkspace should call apiClient.deleteWorkspace', async () => {
        mockApiClient.deleteWorkspace.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteWorkspace(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteWorkspace).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useDeletedWorkspaces should fetch deleted workspaces', async () => {
        const deletedWorkspaces = [{ id: '1', name: 'Deleted', deletedAt: new Date() }];
        mockApiClient.getDeletedWorkspaces.mockResolvedValue(deletedWorkspaces);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeletedWorkspaces(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(deletedWorkspaces);
    });
    (0, vitest_1.it)('useRestoreWorkspace should restore workspace', async () => {
        mockApiClient.restoreWorkspace.mockResolvedValue({ id: '1', name: 'Restored' });
        const { result } = (0, react_1.renderHook)(() => hooks.useRestoreWorkspace(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.restoreWorkspace).toHaveBeenCalledWith('1');
    });
});
(0, vitest_1.describe)('Task Hooks', () => {
    (0, vitest_1.it)('useTasks should fetch tasks from apiClient', async () => {
        const mockTasks = [
            { id: '1', title: 'Task 1', status: 'TODO' },
            { id: '2', title: 'Task 2', status: 'DONE' },
        ];
        mockApiClient.getTasks.mockResolvedValue(mockTasks);
        const { result } = (0, react_1.renderHook)(() => hooks.useTasks(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockTasks);
        (0, vitest_1.expect)(mockApiClient.getTasks).toHaveBeenCalledTimes(1);
    });
    (0, vitest_1.it)('useTasks should fetch tasks by project', async () => {
        const mockTasks = [{ id: '1', title: 'Task 1', projectId: 'project-1' }];
        mockApiClient.getTasks.mockResolvedValue(mockTasks);
        const { result } = (0, react_1.renderHook)(() => hooks.useTasks('project-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(mockApiClient.getTasks).toHaveBeenCalledWith('project-1', undefined);
    });
    (0, vitest_1.it)('useTask should fetch single task', async () => {
        const mockTask = { id: '1', title: 'Task 1', status: 'TODO' };
        mockApiClient.getTask.mockResolvedValue(mockTask);
        const { result } = (0, react_1.renderHook)(() => hooks.useTask('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockTask);
        (0, vitest_1.expect)(mockApiClient.getTask).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useTask should be disabled when taskId is empty', () => {
        const { result } = (0, react_1.renderHook)(() => hooks.useTask(''), { wrapper });
        (0, vitest_1.expect)(result.current.fetchStatus).toBe('idle');
    });
    (0, vitest_1.it)('useTaskDetails should fetch task details', async () => {
        const mockDetails = { id: '1', title: 'Task 1', comments: [], attachments: [] };
        mockApiClient.getTaskDetails.mockResolvedValue(mockDetails);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskDetails('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockDetails);
    });
    (0, vitest_1.it)('useCreateTask should call apiClient.createTask and invalidate cache', async () => {
        const newTask = { id: '1', title: 'New Task', status: 'TODO', projectId: 'project-1' };
        mockApiClient.createTask.mockResolvedValue(newTask);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateTask(), { wrapper });
        const createData = {
            title: 'New Task',
            projectId: 'project-1',
        };
        await result.current.mutateAsync(createData);
        (0, vitest_1.expect)(mockApiClient.createTask).toHaveBeenCalledWith(createData);
    });
    (0, vitest_1.it)('useUpdateTask should call apiClient.updateTask with optimistic update', async () => {
        const updatedTask = { id: '1', title: 'Updated Task', status: 'DONE' };
        mockApiClient.updateTask.mockResolvedValue(updatedTask);
        // Prefill cache
        queryClient.setQueryData(['tasks', '1'], { id: '1', title: 'Original Task', status: 'TODO' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateTask(), { wrapper });
        const updateData = {
            taskId: '1',
            data: { title: 'Updated Task', status: 'DONE' },
        };
        await result.current.mutateAsync(updateData);
        (0, vitest_1.expect)(mockApiClient.updateTask).toHaveBeenCalledWith('1', { title: 'Updated Task', status: 'DONE' });
    });
    (0, vitest_1.it)('useCompleteTask should call apiClient.completeTask', async () => {
        const completedTask = { id: '1', title: 'Task 1', status: 'COMPLETED' };
        mockApiClient.completeTask.mockResolvedValue(completedTask);
        const { result } = (0, react_1.renderHook)(() => hooks.useCompleteTask(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.completeTask).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useDeleteTask should call apiClient.deleteTask', async () => {
        mockApiClient.deleteTask.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteTask(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteTask).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useCreateSubtask should create subtask', async () => {
        const subtask = { id: '2', title: 'Subtask', parentTaskId: '1' };
        mockApiClient.createSubtask.mockResolvedValue(subtask);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateSubtask(), { wrapper });
        await result.current.mutateAsync({
            parentTaskId: '1',
            data: { title: 'Subtask' },
        });
        (0, vitest_1.expect)(mockApiClient.createSubtask).toHaveBeenCalledWith('1', { title: 'Subtask' });
    });
});
(0, vitest_1.describe)('Timer Hooks', () => {
    (0, vitest_1.it)('useActiveTimer should fetch active timer', async () => {
        const activeTimer = { id: '1', type: 'WORK', startedAt: new Date() };
        mockApiClient.getActiveTimer.mockResolvedValue(activeTimer);
        const { result } = (0, react_1.renderHook)(() => hooks.useActiveTimer(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(activeTimer);
    });
    (0, vitest_1.it)('useStartTimer should call apiClient.startTimer', async () => {
        const session = { id: '1', type: 'WORK', startedAt: new Date() };
        mockApiClient.startTimer.mockResolvedValue(session);
        const { result } = (0, react_1.renderHook)(() => hooks.useStartTimer(), { wrapper });
        const startData = {
            type: 'WORK',
            taskId: 'task-1',
        };
        await result.current.mutateAsync(startData);
        (0, vitest_1.expect)(mockApiClient.startTimer).toHaveBeenCalledWith(startData);
    });
    (0, vitest_1.it)('useStopTimer should call apiClient.stopTimer', async () => {
        const session = { id: '1', type: 'WORK', endedAt: new Date() };
        mockApiClient.stopTimer.mockResolvedValue(session);
        const { result } = (0, react_1.renderHook)(() => hooks.useStopTimer(), { wrapper });
        await result.current.mutateAsync({});
        (0, vitest_1.expect)(mockApiClient.stopTimer).toHaveBeenCalled();
    });
    (0, vitest_1.it)('usePauseTimer should pause timer', async () => {
        mockApiClient.pauseTimer.mockResolvedValue({ id: '1', paused: true });
        const { result } = (0, react_1.renderHook)(() => hooks.usePauseTimer(), { wrapper });
        await result.current.mutateAsync();
        (0, vitest_1.expect)(mockApiClient.pauseTimer).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useResumeTimer should resume timer', async () => {
        mockApiClient.resumeTimer.mockResolvedValue({ id: '1', paused: false });
        const { result } = (0, react_1.renderHook)(() => hooks.useResumeTimer(), { wrapper });
        await result.current.mutateAsync({ pauseStartedAt: new Date() });
        (0, vitest_1.expect)(mockApiClient.resumeTimer).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useSwitchTask should switch to different task', async () => {
        mockApiClient.switchTask.mockResolvedValue({ id: '1', taskId: 'task-2' });
        const { result } = (0, react_1.renderHook)(() => hooks.useSwitchTask(), { wrapper });
        await result.current.mutateAsync({ newTaskId: 'task-2' });
        (0, vitest_1.expect)(mockApiClient.switchTask).toHaveBeenCalledWith({ newTaskId: 'task-2' });
    });
    (0, vitest_1.it)('useSessionHistory should fetch sessions', async () => {
        const mockSessions = [
            { id: '1', type: 'WORK', duration: 25 },
            { id: '2', type: 'SHORT_BREAK', duration: 5 },
        ];
        mockApiClient.getSessionHistory.mockResolvedValue(mockSessions);
        const { result } = (0, react_1.renderHook)(() => hooks.useSessionHistory({}), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockSessions);
        (0, vitest_1.expect)(mockApiClient.getSessionHistory).toHaveBeenCalledWith({});
    });
    (0, vitest_1.it)('useTimerStats should fetch timer statistics', async () => {
        const stats = { totalMinutes: 120, sessionsCompleted: 4 };
        mockApiClient.getTimerStats.mockResolvedValue(stats);
        const { result } = (0, react_1.renderHook)(() => hooks.useTimerStats(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(stats);
    });
    (0, vitest_1.it)('useTaskTimeSessions should fetch sessions for task', async () => {
        const sessions = [{ id: '1', taskId: 'task-1', duration: 25 }];
        mockApiClient.getTaskTimeSessions.mockResolvedValue(sessions);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskTimeSessions('task-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(sessions);
    });
});
(0, vitest_1.describe)('Analytics Hooks', () => {
    (0, vitest_1.it)('useDailyMetrics should fetch metrics from apiClient', async () => {
        const mockMetrics = {
            tasksCompleted: 10,
            minutesWorked: 240,
            pomodorosCompleted: 4,
            focusScore: 0.85,
        };
        mockApiClient.getDailyMetrics.mockResolvedValue(mockMetrics);
        const { result } = (0, react_1.renderHook)(() => hooks.useDailyMetrics({ date: '2026-01-04' }), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockMetrics);
        (0, vitest_1.expect)(mockApiClient.getDailyMetrics).toHaveBeenCalledWith({ date: '2026-01-04' });
    });
    (0, vitest_1.it)('useDailyMetrics should handle missing date', async () => {
        const mockMetrics = { tasksCompleted: 5 };
        mockApiClient.getDailyMetrics.mockResolvedValue(mockMetrics);
        const { result } = (0, react_1.renderHook)(() => hooks.useDailyMetrics(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(mockApiClient.getDailyMetrics).toHaveBeenCalledWith(undefined);
    });
    (0, vitest_1.it)('useWeeklyMetrics should fetch weekly metrics', async () => {
        const mockMetrics = [
            { date: '2026-01-01', tasksCompleted: 8 },
            { date: '2026-01-02', tasksCompleted: 12 },
        ];
        mockApiClient.getWeeklyMetrics.mockResolvedValue(mockMetrics);
        const { result } = (0, react_1.renderHook)(() => hooks.useWeeklyMetrics(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockMetrics);
    });
    (0, vitest_1.it)('useDashboardStats should fetch dashboard statistics', async () => {
        const stats = { totalTasks: 100, completedTasks: 50 };
        mockApiClient.getDashboardStats.mockResolvedValue(stats);
        const { result } = (0, react_1.renderHook)(() => hooks.useDashboardStats(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(stats);
    });
    (0, vitest_1.it)('useHeatmapData should fetch heatmap data', async () => {
        const heatmap = [{ date: '2026-01-01', count: 10 }];
        mockApiClient.getHeatmapData.mockResolvedValue(heatmap);
        const { result } = (0, react_1.renderHook)(() => hooks.useHeatmapData(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(heatmap);
    });
    (0, vitest_1.it)('useProjectDistribution should fetch project distribution', async () => {
        const distribution = [{ projectId: '1', count: 20 }];
        mockApiClient.getProjectDistribution.mockResolvedValue(distribution);
        const { result } = (0, react_1.renderHook)(() => hooks.useProjectDistribution(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(distribution);
    });
    (0, vitest_1.it)('useTaskStatusDistribution should fetch status distribution', async () => {
        const distribution = [{ status: 'TODO', count: 10 }];
        mockApiClient.getTaskStatusDistribution.mockResolvedValue(distribution);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskStatusDistribution(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(distribution);
    });
});
(0, vitest_1.describe)('Project Hooks', () => {
    (0, vitest_1.it)('useProjects should fetch projects from apiClient', async () => {
        const mockProjects = [
            { id: '1', name: 'Project 1', status: 'ACTIVE' },
            { id: '2', name: 'Project 2', status: 'ACTIVE' },
        ];
        mockApiClient.getProjects.mockResolvedValue(mockProjects);
        const { result } = (0, react_1.renderHook)(() => hooks.useProjects('workspace-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockProjects);
        (0, vitest_1.expect)(mockApiClient.getProjects).toHaveBeenCalledWith('workspace-1');
    });
    (0, vitest_1.it)('useProjects should be disabled when workspaceId is empty', () => {
        const { result } = (0, react_1.renderHook)(() => hooks.useProjects(''), { wrapper });
        (0, vitest_1.expect)(result.current.fetchStatus).toBe('idle');
    });
    (0, vitest_1.it)('useAllProjects should fetch all projects', async () => {
        const mockProjects = [
            { id: '1', name: 'Project 1', workspaceId: 'workspace-1' },
            { id: '2', name: 'Project 2', workspaceId: 'workspace-2' },
        ];
        mockApiClient.getAllProjects.mockResolvedValue(mockProjects);
        const { result } = (0, react_1.renderHook)(() => hooks.useAllProjects(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockProjects);
    });
    (0, vitest_1.it)('useProject should fetch single project', async () => {
        const mockProject = { id: '1', name: 'Project 1', status: 'ACTIVE' };
        mockApiClient.getProject.mockResolvedValue(mockProject);
        const { result } = (0, react_1.renderHook)(() => hooks.useProject('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockProject);
    });
    (0, vitest_1.it)('useProject should be disabled when projectId is empty', () => {
        const { result } = (0, react_1.renderHook)(() => hooks.useProject(''), { wrapper });
        (0, vitest_1.expect)(result.current.fetchStatus).toBe('idle');
    });
    (0, vitest_1.it)('useCreateProject should call apiClient.createProject', async () => {
        const newProject = { id: '1', name: 'New Project', status: 'ACTIVE', workspaceId: 'workspace-1' };
        mockApiClient.createProject.mockResolvedValue(newProject);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateProject(), { wrapper });
        const createData = {
            name: 'New Project',
            workspaceId: 'workspace-1',
        };
        await result.current.mutateAsync(createData);
        (0, vitest_1.expect)(mockApiClient.createProject).toHaveBeenCalledWith(createData);
    });
    (0, vitest_1.it)('useUpdateProject should call apiClient.updateProject', async () => {
        const updatedProject = { id: '1', name: 'Updated Project' };
        mockApiClient.updateProject.mockResolvedValue(updatedProject);
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateProject(), { wrapper });
        await result.current.mutateAsync({
            projectId: '1',
            data: { name: 'Updated Project' },
        });
        (0, vitest_1.expect)(mockApiClient.updateProject).toHaveBeenCalledWith('1', { name: 'Updated Project' });
    });
    (0, vitest_1.it)('useArchiveProject should archive project', async () => {
        mockApiClient.archiveProject.mockResolvedValue({ id: '1', archived: true });
        const { result } = (0, react_1.renderHook)(() => hooks.useArchiveProject(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.archiveProject).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useCompleteProject should complete project', async () => {
        mockApiClient.completeProject.mockResolvedValue({ id: '1', status: 'COMPLETED' });
        const { result } = (0, react_1.renderHook)(() => hooks.useCompleteProject(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.completeProject).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useDeleteProject should delete project', async () => {
        mockApiClient.deleteProject.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteProject(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteProject).toHaveBeenCalledWith('1');
    });
});
(0, vitest_1.describe)('Tag Hooks', () => {
    (0, vitest_1.it)('useTags should fetch tags from apiClient', async () => {
        const mockTags = [
            { id: '1', name: 'Urgent', color: 'red' },
            { id: '2', name: 'Important', color: 'blue' },
        ];
        mockApiClient.getTags.mockResolvedValue(mockTags);
        const { result } = (0, react_1.renderHook)(() => hooks.useTags('workspace-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockTags);
    });
    (0, vitest_1.it)('useTaskTags should fetch tags for task', async () => {
        const mockTags = [{ id: '1', name: 'Urgent' }];
        mockApiClient.getTaskTags.mockResolvedValue(mockTags);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskTags('task-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockTags);
    });
    (0, vitest_1.it)('useCreateTag should create tag', async () => {
        const newTag = { id: '1', name: 'New Tag', workspaceId: 'workspace-1' };
        mockApiClient.createTag.mockResolvedValue(newTag);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateTag(), { wrapper });
        await result.current.mutateAsync({ name: 'New Tag', workspaceId: 'workspace-1' });
        (0, vitest_1.expect)(mockApiClient.createTag).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useAssignTagToTask should assign tag to task', async () => {
        mockApiClient.assignTagToTask.mockResolvedValue({ success: true });
        const { result } = (0, react_1.renderHook)(() => hooks.useAssignTagToTask(), { wrapper });
        await result.current.mutateAsync({ tagId: 'tag-1', taskId: 'task-1' });
        (0, vitest_1.expect)(mockApiClient.assignTagToTask).toHaveBeenCalledWith('tag-1', 'task-1');
    });
    (0, vitest_1.it)('useRemoveTagFromTask should remove tag from task', async () => {
        mockApiClient.removeTagFromTask.mockResolvedValue({ success: true });
        const { result } = (0, react_1.renderHook)(() => hooks.useRemoveTagFromTask(), { wrapper });
        await result.current.mutateAsync({ tagId: 'tag-1', taskId: 'task-1' });
        (0, vitest_1.expect)(mockApiClient.removeTagFromTask).toHaveBeenCalledWith('tag-1', 'task-1');
    });
    (0, vitest_1.it)('useDeleteTag should delete tag', async () => {
        mockApiClient.deleteTag.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteTag(), { wrapper });
        await result.current.mutateAsync('tag-1');
        (0, vitest_1.expect)(mockApiClient.deleteTag).toHaveBeenCalledWith('tag-1');
    });
});
(0, vitest_1.describe)('Habit Hooks', () => {
    (0, vitest_1.it)('useHabits should fetch habits from apiClient', async () => {
        const mockHabits = [
            { id: '1', name: 'Exercise', frequency: 'DAILY' },
            { id: '2', name: 'Read', frequency: 'WEEKLY' },
        ];
        mockApiClient.getHabits.mockResolvedValue(mockHabits);
        const { result } = (0, react_1.renderHook)(() => hooks.useHabits(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(mockHabits);
    });
    (0, vitest_1.it)('useTodayHabits should fetch today habits', async () => {
        const todayHabits = [{ id: '1', name: 'Exercise', completed: false }];
        mockApiClient.getTodayHabits.mockResolvedValue(todayHabits);
        const { result } = (0, react_1.renderHook)(() => hooks.useTodayHabits(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(todayHabits);
    });
    (0, vitest_1.it)('useHabit should fetch single habit', async () => {
        const habit = { id: '1', name: 'Exercise', frequency: 'DAILY' };
        mockApiClient.getHabit.mockResolvedValue(habit);
        const { result } = (0, react_1.renderHook)(() => hooks.useHabit('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(habit);
    });
    (0, vitest_1.it)('useHabitStats should fetch habit statistics', async () => {
        const stats = { streak: 7, completionRate: 0.85 };
        mockApiClient.getHabitStats.mockResolvedValue(stats);
        const { result } = (0, react_1.renderHook)(() => hooks.useHabitStats('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(stats);
    });
    (0, vitest_1.it)('useCreateHabit should create habit', async () => {
        const newHabit = { id: '1', name: 'New Habit' };
        mockApiClient.createHabit.mockResolvedValue(newHabit);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateHabit(), { wrapper });
        await result.current.mutateAsync({ name: 'New Habit', frequency: 'DAILY' });
        (0, vitest_1.expect)(mockApiClient.createHabit).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useUpdateHabit should update habit', async () => {
        mockApiClient.updateHabit.mockResolvedValue({ id: '1', name: 'Updated' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateHabit(), { wrapper });
        await result.current.mutateAsync({ habitId: '1', data: { name: 'Updated' } });
        (0, vitest_1.expect)(mockApiClient.updateHabit).toHaveBeenCalledWith('1', { name: 'Updated' });
    });
    (0, vitest_1.it)('useDeleteHabit should delete habit', async () => {
        mockApiClient.deleteHabit.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteHabit(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteHabit).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useCompleteHabit should complete habit', async () => {
        const completion = { id: '1', habitId: 'habit-1', completedDate: '2026-01-04' };
        mockApiClient.completeHabit.mockResolvedValue(completion);
        const { result } = (0, react_1.renderHook)(() => hooks.useCompleteHabit(), { wrapper });
        await result.current.mutateAsync({ habitId: 'habit-1', date: '2026-01-04' });
        (0, vitest_1.expect)(mockApiClient.completeHabit).toHaveBeenCalledWith('habit-1', { date: '2026-01-04' });
    });
    (0, vitest_1.it)('useUncompleteHabit should uncomplete habit', async () => {
        mockApiClient.uncompleteHabit.mockResolvedValue({ success: true });
        const { result } = (0, react_1.renderHook)(() => hooks.useUncompleteHabit(), { wrapper });
        await result.current.mutateAsync('habit-1');
        (0, vitest_1.expect)(mockApiClient.uncompleteHabit).toHaveBeenCalledWith('habit-1');
    });
    (0, vitest_1.it)('usePauseHabit should pause habit', async () => {
        mockApiClient.pauseHabit.mockResolvedValue({ id: '1', paused: true });
        const { result } = (0, react_1.renderHook)(() => hooks.usePauseHabit(), { wrapper });
        await result.current.mutateAsync('habit-1');
        (0, vitest_1.expect)(mockApiClient.pauseHabit).toHaveBeenCalledWith('habit-1');
    });
    (0, vitest_1.it)('useResumeHabit should resume habit', async () => {
        mockApiClient.resumeHabit.mockResolvedValue({ id: '1', paused: false });
        const { result } = (0, react_1.renderHook)(() => hooks.useResumeHabit(), { wrapper });
        await result.current.mutateAsync('habit-1');
        (0, vitest_1.expect)(mockApiClient.resumeHabit).toHaveBeenCalledWith('habit-1');
    });
});
(0, vitest_1.describe)('AI Hooks', () => {
    (0, vitest_1.it)('useAIProfile should fetch AI profile', async () => {
        const profile = { productivityPatterns: [], optimalWorkTimes: [] };
        mockApiClient.getAIProfile.mockResolvedValue(profile);
        const { result } = (0, react_1.renderHook)(() => hooks.useAIProfile(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(profile);
    });
    (0, vitest_1.it)('useOptimalSchedule should fetch optimal schedule', async () => {
        const schedule = [{ taskId: '1', startTime: '09:00' }];
        mockApiClient.getOptimalSchedule.mockResolvedValue(schedule);
        const { result } = (0, react_1.renderHook)(() => hooks.useOptimalSchedule({ topN: 5 }), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(schedule);
    });
    (0, vitest_1.it)('useTaskDurationPrediction should predict duration', async () => {
        const prediction = { estimatedMinutes: 30 };
        mockApiClient.predictTaskDuration.mockResolvedValue(prediction);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskDurationPrediction({ title: 'New Task' }), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(prediction);
    });
    (0, vitest_1.it)('useTaskDurationPrediction should be disabled without title', () => {
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskDurationPrediction(), { wrapper });
        (0, vitest_1.expect)(result.current.fetchStatus).toBe('idle');
    });
    (0, vitest_1.it)('useGenerateWeeklyReport should generate report', async () => {
        const report = { id: '1', weekStart: '2026-01-01' };
        mockApiClient.generateWeeklyReport.mockResolvedValue(report);
        const { result } = (0, react_1.renderHook)(() => hooks.useGenerateWeeklyReport(), { wrapper });
        await result.current.mutateAsync('2026-01-01');
        (0, vitest_1.expect)(mockApiClient.generateWeeklyReport).toHaveBeenCalledWith('2026-01-01');
    });
    (0, vitest_1.it)('useReports should fetch reports', async () => {
        const reports = [{ id: '1', title: 'Week 1' }];
        mockApiClient.getReports.mockResolvedValue(reports);
        const { result } = (0, react_1.renderHook)(() => hooks.useReports(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(reports);
    });
    (0, vitest_1.it)('useReport should fetch single report', async () => {
        const report = { id: '1', title: 'Week 1', content: '...' };
        mockApiClient.getReport.mockResolvedValue(report);
        const { result } = (0, react_1.renderHook)(() => hooks.useReport('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(report);
    });
    (0, vitest_1.it)('useDeleteReport should delete report', async () => {
        mockApiClient.deleteReport.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteReport(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteReport).toHaveBeenCalledWith('1');
    });
});
(0, vitest_1.describe)('Comment Hooks', () => {
    (0, vitest_1.it)('useTaskComments should fetch comments', async () => {
        const comments = [{ id: '1', taskId: 'task-1', content: 'Comment 1' }];
        mockApiClient.getTaskComments.mockResolvedValue(comments);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskComments('task-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(comments);
    });
    (0, vitest_1.it)('useCreateComment should create comment', async () => {
        const comment = { id: '1', taskId: 'task-1', content: 'New comment' };
        mockApiClient.createComment.mockResolvedValue(comment);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateComment(), { wrapper });
        await result.current.mutateAsync({ taskId: 'task-1', content: 'New comment' });
        (0, vitest_1.expect)(mockApiClient.createComment).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useUpdateComment should update comment', async () => {
        mockApiClient.updateComment.mockResolvedValue({ id: '1', content: 'Updated' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateComment(), { wrapper });
        await result.current.mutateAsync({ commentId: '1', data: { content: 'Updated' } });
        (0, vitest_1.expect)(mockApiClient.updateComment).toHaveBeenCalledWith('1', { content: 'Updated' });
    });
    (0, vitest_1.it)('useDeleteComment should delete comment', async () => {
        mockApiClient.deleteComment.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteComment(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteComment).toHaveBeenCalledWith('1');
    });
});
(0, vitest_1.describe)('Attachment Hooks', () => {
    (0, vitest_1.it)('useTaskAttachments should fetch attachments', async () => {
        const attachments = [{ id: '1', taskId: 'task-1', filename: 'file.pdf' }];
        mockApiClient.getTaskAttachments.mockResolvedValue(attachments);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskAttachments('task-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(attachments);
    });
    (0, vitest_1.it)('useCreateAttachment should create attachment', async () => {
        const attachment = { id: '1', taskId: 'task-1', filename: 'file.pdf' };
        mockApiClient.createAttachment.mockResolvedValue(attachment);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateAttachment(), { wrapper });
        await result.current.mutateAsync({ taskId: 'task-1', file: new File([''], 'file.pdf') });
        (0, vitest_1.expect)(mockApiClient.createAttachment).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useDeleteAttachment should delete attachment', async () => {
        mockApiClient.deleteAttachment.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteAttachment(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteAttachment).toHaveBeenCalledWith('1');
    });
});
(0, vitest_1.describe)('Workflow Hooks', () => {
    (0, vitest_1.it)('useWorkflows should fetch workflows', async () => {
        const workflows = [{ id: '1', name: 'Workflow 1', workspaceId: 'workspace-1' }];
        mockApiClient.getWorkflows.mockResolvedValue(workflows);
        const { result } = (0, react_1.renderHook)(() => hooks.useWorkflows('workspace-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(workflows);
    });
    (0, vitest_1.it)('useWorkflows should be disabled without workspaceId', () => {
        const { result } = (0, react_1.renderHook)(() => hooks.useWorkflows(''), { wrapper });
        (0, vitest_1.expect)(result.current.fetchStatus).toBe('idle');
    });
    (0, vitest_1.it)('useCreateWorkflow should create workflow', async () => {
        const workflow = { id: '1', name: 'New Workflow' };
        mockApiClient.createWorkflow.mockResolvedValue(workflow);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateWorkflow(), { wrapper });
        await result.current.mutateAsync({ name: 'New Workflow', workspaceId: 'workspace-1' });
        (0, vitest_1.expect)(mockApiClient.createWorkflow).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useUpdateWorkflow should update workflow', async () => {
        mockApiClient.updateWorkflow.mockResolvedValue({ id: '1', name: 'Updated' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateWorkflow(), { wrapper });
        await result.current.mutateAsync({ workflowId: '1', data: { name: 'Updated' } });
        (0, vitest_1.expect)(mockApiClient.updateWorkflow).toHaveBeenCalledWith('1', { name: 'Updated' });
    });
    (0, vitest_1.it)('useDeleteWorkflow should delete workflow', async () => {
        mockApiClient.deleteWorkflow.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteWorkflow(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteWorkflow).toHaveBeenCalledWith('1');
    });
});
(0, vitest_1.describe)('Objective (OKR) Hooks', () => {
    (0, vitest_1.it)('useObjectives should fetch objectives', async () => {
        const objectives = [{ id: '1', title: 'Objective 1' }];
        mockApiClient.getObjectives.mockResolvedValue(objectives);
        const { result } = (0, react_1.renderHook)(() => hooks.useObjectives(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(objectives);
    });
    (0, vitest_1.it)('useCurrentPeriodObjectives should fetch current objectives', async () => {
        const objectives = [{ id: '1', title: 'Current Objective' }];
        mockApiClient.getCurrentPeriodObjectives.mockResolvedValue(objectives);
        const { result } = (0, react_1.renderHook)(() => hooks.useCurrentPeriodObjectives(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(objectives);
    });
    (0, vitest_1.it)('useObjectivesDashboard should fetch dashboard summary', async () => {
        const summary = { totalObjectives: 5, completionRate: 0.6 };
        mockApiClient.getObjectivesDashboardSummary.mockResolvedValue(summary);
        const { result } = (0, react_1.renderHook)(() => hooks.useObjectivesDashboard(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(summary);
    });
    (0, vitest_1.it)('useObjective should fetch single objective', async () => {
        const objective = { id: '1', title: 'Objective 1', keyResults: [] };
        mockApiClient.getObjective.mockResolvedValue(objective);
        const { result } = (0, react_1.renderHook)(() => hooks.useObjective('1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(objective);
    });
    (0, vitest_1.it)('useCreateObjective should create objective', async () => {
        const objective = { id: '1', title: 'New Objective' };
        mockApiClient.createObjective.mockResolvedValue(objective);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateObjective(), { wrapper });
        await result.current.mutateAsync({ title: 'New Objective', workspaceId: 'workspace-1' });
        (0, vitest_1.expect)(mockApiClient.createObjective).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useUpdateObjective should update objective', async () => {
        mockApiClient.updateObjective.mockResolvedValue({ id: '1', title: 'Updated' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateObjective(), { wrapper });
        await result.current.mutateAsync({ objectiveId: '1', data: { title: 'Updated' } });
        (0, vitest_1.expect)(mockApiClient.updateObjective).toHaveBeenCalledWith('1', { title: 'Updated' });
    });
    (0, vitest_1.it)('useDeleteObjective should delete objective', async () => {
        mockApiClient.deleteObjective.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteObjective(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteObjective).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useAddKeyResult should add key result', async () => {
        const keyResult = { id: '1', title: 'Key Result 1' };
        mockApiClient.addKeyResult.mockResolvedValue(keyResult);
        const { result } = (0, react_1.renderHook)(() => hooks.useAddKeyResult(), { wrapper });
        await result.current.mutateAsync({ objectiveId: '1', data: { title: 'Key Result 1' } });
        (0, vitest_1.expect)(mockApiClient.addKeyResult).toHaveBeenCalledWith('1', { title: 'Key Result 1' });
    });
    (0, vitest_1.it)('useUpdateKeyResult should update key result', async () => {
        mockApiClient.updateKeyResult.mockResolvedValue({ id: '1', title: 'Updated' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateKeyResult(), { wrapper });
        await result.current.mutateAsync({ keyResultId: '1', data: { title: 'Updated' } });
        (0, vitest_1.expect)(mockApiClient.updateKeyResult).toHaveBeenCalledWith('1', { title: 'Updated' });
    });
    (0, vitest_1.it)('useDeleteKeyResult should delete key result', async () => {
        mockApiClient.deleteKeyResult.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteKeyResult(), { wrapper });
        await result.current.mutateAsync('1');
        (0, vitest_1.expect)(mockApiClient.deleteKeyResult).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useLinkTaskToKeyResult should link task', async () => {
        mockApiClient.linkTaskToKeyResult.mockResolvedValue({ success: true });
        const { result } = (0, react_1.renderHook)(() => hooks.useLinkTaskToKeyResult(), { wrapper });
        await result.current.mutateAsync({ keyResultId: '1', data: { taskId: 'task-1' } });
        (0, vitest_1.expect)(mockApiClient.linkTaskToKeyResult).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useUnlinkTaskFromKeyResult should unlink task', async () => {
        mockApiClient.unlinkTaskFromKeyResult.mockResolvedValue({ success: true });
        const { result } = (0, react_1.renderHook)(() => hooks.useUnlinkTaskFromKeyResult(), { wrapper });
        await result.current.mutateAsync({ keyResultId: '1', taskId: 'task-1' });
        (0, vitest_1.expect)(mockApiClient.unlinkTaskFromKeyResult).toHaveBeenCalledWith('1', 'task-1');
    });
});
(0, vitest_1.describe)('Custom Field Hooks', () => {
    (0, vitest_1.it)('useCustomFields should fetch custom fields', async () => {
        const fields = [{ id: '1', name: 'Priority', type: 'SELECT' }];
        mockApiClient.getProjectCustomFields.mockResolvedValue(fields);
        const { result } = (0, react_1.renderHook)(() => hooks.useCustomFields('project-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(fields);
    });
    (0, vitest_1.it)('useCreateCustomField should create custom field', async () => {
        const field = { id: '1', name: 'Priority', type: 'SELECT' };
        mockApiClient.createCustomField.mockResolvedValue(field);
        const { result } = (0, react_1.renderHook)(() => hooks.useCreateCustomField(), { wrapper });
        await result.current.mutateAsync({ projectId: 'project-1', data: { name: 'Priority', type: 'SELECT' } });
        (0, vitest_1.expect)(mockApiClient.createCustomField).toHaveBeenCalled();
    });
    (0, vitest_1.it)('useUpdateCustomField should update custom field', async () => {
        mockApiClient.updateCustomField.mockResolvedValue({ id: '1', name: 'Updated' });
        const { result } = (0, react_1.renderHook)(() => hooks.useUpdateCustomField(), { wrapper });
        await result.current.mutateAsync({ fieldId: '1', data: { name: 'Updated' }, projectId: 'project-1' });
        (0, vitest_1.expect)(mockApiClient.updateCustomField).toHaveBeenCalledWith('1', { name: 'Updated' });
    });
    (0, vitest_1.it)('useDeleteCustomField should delete custom field', async () => {
        mockApiClient.deleteCustomField.mockResolvedValue(undefined);
        const { result } = (0, react_1.renderHook)(() => hooks.useDeleteCustomField(), { wrapper });
        await result.current.mutateAsync({ fieldId: '1', projectId: 'project-1' });
        (0, vitest_1.expect)(mockApiClient.deleteCustomField).toHaveBeenCalledWith('1');
    });
    (0, vitest_1.it)('useTaskCustomValues should fetch task custom values', async () => {
        const values = { priority: 'High' };
        mockApiClient.getTaskCustomValues.mockResolvedValue(values);
        const { result } = (0, react_1.renderHook)(() => hooks.useTaskCustomValues('task-1'), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual(values);
    });
    (0, vitest_1.it)('useSetTaskCustomValues should set custom values', async () => {
        mockApiClient.setTaskCustomValues.mockResolvedValue({ success: true });
        const { result } = (0, react_1.renderHook)(() => hooks.useSetTaskCustomValues(), { wrapper });
        await result.current.mutateAsync({ taskId: 'task-1', data: { priority: 'High' } });
        (0, vitest_1.expect)(mockApiClient.setTaskCustomValues).toHaveBeenCalledWith('task-1', { priority: 'High' });
    });
});
(0, vitest_1.describe)('Error Handling and Edge Cases', () => {
    (0, vitest_1.it)('should handle network errors gracefully', async () => {
        mockApiClient.getTasks.mockRejectedValue(new Error('Network error'));
        const { result } = (0, react_1.renderHook)(() => hooks.useTasks(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isError).toBe(true);
        });
        (0, vitest_1.expect)(result.current.error).toBeDefined();
        (0, vitest_1.expect)(result.current.error.message).toBe('Network error');
    });
    (0, vitest_1.it)('should handle empty responses', async () => {
        mockApiClient.getTasks.mockResolvedValue([]);
        const { result } = (0, react_1.renderHook)(() => hooks.useTasks(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toEqual([]);
    });
    (0, vitest_1.it)('should handle null responses', async () => {
        mockApiClient.getCurrentUser.mockResolvedValue(null);
        const { result } = (0, react_1.renderHook)(() => hooks.useCurrentUser(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isSuccess).toBe(true);
        });
        (0, vitest_1.expect)(result.current.data).toBeNull();
    });
    (0, vitest_1.it)('should handle timeout errors', async () => {
        mockApiClient.getTasks.mockRejectedValue(new Error('Request timeout'));
        const { result } = (0, react_1.renderHook)(() => hooks.useTasks(), { wrapper });
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(result.current.isError).toBe(true);
        });
        (0, vitest_1.expect)(result.current.error.message).toBe('Request timeout');
    });
});
;
