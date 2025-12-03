/**
 * React Query Hooks for API Client
 *
 * Custom hooks wrapping the API client with React Query for:
 * - Automatic caching and refetching
 * - Loading and error states
 * - Optimistic updates
 * - Cache invalidation
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import type {
  // Auth
  RegisterDto,
  LoginDto,
  // User
  UpdateProfileDto,
  // Workspace
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  AddMemberDto,
  // Workflow
  CreateWorkflowDto,
  UpdateWorkflowDto,
  // Project
  CreateProjectDto,
  UpdateProjectDto,
  // Task
  CreateTaskDto,
  UpdateTaskDto,
  CreateSubtaskDto,
  // Tag
  CreateTagDto,
  UpdateTagDto,
  // Timer
  StartTimerDto,
  StopTimerDto,
  GetDailyMetricsParams,
  // Comment
  CreateCommentDto,
  UpdateCommentDto,
  // Attachment
  CreateAttachmentDto,
  InviteMemberDto,
  AcceptInvitationDto,
} from '@ordo-todo/api-client';

// ============ QUERY KEYS ============

export const queryKeys = {
  // Auth & User
  currentUser: ['user', 'current'] as const,

  // Workspaces
  workspaces: ['workspaces'] as const,
  workspace: (id: string) => ['workspaces', id] as const,
  workspaceMembers: (id: string) => ['workspaces', id, 'members'] as const,
  workspaceInvitations: (id: string) => ['workspaces', id, 'invitations'] as const,
  workspaceSettings: (id: string) => ['workspaces', id, 'settings'] as const,
  workspaceAuditLogs: (id: string, params?: { limit?: number; offset?: number }) =>
    ['workspaces', id, 'audit-logs', params] as const,

  // Workflows
  workflows: (workspaceId: string) => ['workflows', workspaceId] as const,

  // Projects
  projects: (workspaceId: string) => ['projects', workspaceId] as const,
  allProjects: ['projects', 'all'] as const,
  project: (id: string) => ['projects', id] as const,

  // Tasks
  tasks: (projectId?: string) => projectId ? ['tasks', projectId] as const : ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  taskDetails: (id: string) => ['tasks', id, 'details'] as const,

  // Timer
  activeTimer: ['timer', 'active'] as const,
  timerHistory: (params?: { taskId?: string; type?: string; startDate?: string; endDate?: string; page?: number; limit?: number; completedOnly?: boolean }) =>
    ['timer', 'history', params] as const,
  timerStats: (params?: { startDate?: string; endDate?: string }) =>
    ['timer', 'stats', params] as const,
  taskTimeSessions: (taskId: string) => ['timer', 'task', taskId] as const,

  // Tags
  tags: (workspaceId: string) => ['tags', workspaceId] as const,
  taskTags: (taskId: string) => ['tasks', taskId, 'tags'] as const,

  // Timer


  // Analytics
  dailyMetrics: (params?: GetDailyMetricsParams) => ['analytics', 'daily', params] as const,
  weeklyMetrics: (params?: { weekStart?: string }) => ['analytics', 'weekly', params] as const,
  monthlyMetrics: (params?: { monthStart?: string }) => ['analytics', 'monthly', params] as const,
  dateRangeMetrics: (startDate: string, endDate: string) => ['analytics', 'range', startDate, endDate] as const,

  // AI
  aiProfile: ['ai', 'profile'] as const,
  optimalSchedule: (params?: { topN?: number }) => ['ai', 'optimal-schedule', params] as const,
  taskDurationPrediction: (params?: { title?: string; description?: string; category?: string; priority?: string }) =>
    ['ai', 'predict-duration', params] as const,

  // AI Reports
  reports: (params?: { scope?: string; limit?: number; offset?: number }) => ['ai', 'reports', params] as const,
  report: (id: string) => ['ai', 'reports', id] as const,

  // Comments
  taskComments: (taskId: string) => ['tasks', taskId, 'comments'] as const,

  // Attachments
  taskAttachments: (taskId: string) => ['tasks', taskId, 'attachments'] as const,
} as const;

// ============ AUTH HOOKS ============

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterDto) => apiClient.register(data),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginDto) => apiClient.login(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
  });
}

// ============ USER HOOKS ============

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => apiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
    },
  });
}

// ============ WORKSPACE HOOKS ============

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: () => apiClient.getWorkspaces(),
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workspace(workspaceId),
    queryFn: () => apiClient.getWorkspace(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) => apiClient.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceDto }) =>
      apiClient.updateWorkspace(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => apiClient.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });
}

export function useAddWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: AddMemberDto }) =>
      apiClient.addWorkspaceMember(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) });
    },
  });
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      apiClient.removeWorkspaceMember(workspaceId, userId),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceMembers(workspaceId) });
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workspaceMembers(workspaceId),
    queryFn: () => apiClient.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceInvitations(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workspaceInvitations(workspaceId),
    queryFn: () => apiClient.getWorkspaceInvitations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: InviteMemberDto }) =>
      apiClient.inviteWorkspaceMember(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceInvitations(workspaceId) });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AcceptInvitationDto) => apiClient.acceptWorkspaceInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });
}

// ============ WORKSPACE SETTINGS HOOKS ============

export function useWorkspaceSettings(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workspaceSettings(workspaceId),
    queryFn: () => apiClient.getWorkspaceSettings(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, data }: {
      workspaceId: string;
      data: {
        defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
        defaultDueTime?: number;
        timezone?: string;
        locale?: string;
      }
    }) => apiClient.updateWorkspaceSettings(workspaceId, data),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSettings(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceAuditLogs(workspaceId) });
    },
  });
}

// ============ WORKSPACE AUDIT LOGS HOOKS ============

export function useWorkspaceAuditLogs(workspaceId: string, params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.workspaceAuditLogs(workspaceId, params),
    queryFn: () => apiClient.getWorkspaceAuditLogs(workspaceId, params),
    enabled: !!workspaceId,
  });
}

// ============ WORKFLOW HOOKS ============

export function useWorkflows(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workflows(workspaceId),
    queryFn: () => apiClient.getWorkflows(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkflowDto) => apiClient.createWorkflow(data),
    onSuccess: (workflow) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows(workflow.workspaceId) });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: string; data: UpdateWorkflowDto }) =>
      apiClient.updateWorkflow(workflowId, data),
    onSuccess: (workflow) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows(workflow.workspaceId) });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workflowId: string) => apiClient.deleteWorkflow(workflowId),
    onSuccess: () => {
      // Invalidate all workflow queries since we don't know which workspace it belonged to
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

// ============ PROJECT HOOKS ============

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.projects(workspaceId),
    queryFn: () => apiClient.getProjects(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useAllProjects() {
  return useQuery({
    queryKey: queryKeys.allProjects,
    queryFn: () => apiClient.getAllProjects(),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => apiClient.createProject(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(project.workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allProjects });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectDto }) =>
      apiClient.updateProject(projectId, data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(project.workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.allProjects });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => apiClient.archiveProject(projectId),
    onSuccess: (project) => {
      // Invalidate specific project query to ensure details page updates immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) });
      // Invalidate all project-related queries (lists, etc)
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCompleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => apiClient.completeProject(projectId),
    onSuccess: (project) => {
      // Invalidate specific project query to ensure details page updates immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) });
      // Invalidate all project-related queries (lists, etc)
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => apiClient.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============ TASK HOOKS ============

export function useTasks(projectId?: string, tags?: string[]) {
  return useQuery({
    queryKey: projectId ? ['tasks', projectId, { tags }] : ['tasks', { tags }],
    queryFn: () => (apiClient as any).getTasks(projectId, tags),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.task(taskId),
    queryFn: () => apiClient.getTask(taskId),
    enabled: !!taskId,
  });
}

export function useTaskDetails(taskId: string) {
  return useQuery({
    queryKey: queryKeys.taskDetails(taskId),
    queryFn: () => apiClient.getTaskDetails(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => apiClient.createTask(data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(task.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDto }) =>
      apiClient.updateTask(taskId, data),
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.task(taskId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.taskDetails(taskId) });

      const previousTask = queryClient.getQueryData(queryKeys.task(taskId));
      const previousTaskDetails = queryClient.getQueryData(queryKeys.taskDetails(taskId));

      if (previousTask) {
        queryClient.setQueryData(queryKeys.task(taskId), (old: any) => ({
          ...old,
          ...data,
        }));
      }

      if (previousTaskDetails) {
        queryClient.setQueryData(queryKeys.taskDetails(taskId), (old: any) => ({
          ...old,
          ...data,
        }));
      }

      return { previousTask, previousTaskDetails };
    },
    onError: (err, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.task(taskId), context.previousTask);
      }
      if (context?.previousTaskDetails) {
        queryClient.setQueryData(queryKeys.taskDetails(taskId), context.previousTaskDetails);
      }
    },
    onSettled: (task, error, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
      if (task) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(task.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.completeTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.task(taskId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.taskDetails(taskId) });

      const previousTask = queryClient.getQueryData(queryKeys.task(taskId));
      const previousTaskDetails = queryClient.getQueryData(queryKeys.taskDetails(taskId));

      if (previousTask) {
        queryClient.setQueryData(queryKeys.task(taskId), (old: any) => ({
          ...old,
          status: 'COMPLETED',
        }));
      }

      if (previousTaskDetails) {
        queryClient.setQueryData(queryKeys.taskDetails(taskId), (old: any) => ({
          ...old,
          status: 'COMPLETED',
        }));
      }

      return { previousTask, previousTaskDetails };
    },
    onError: (err, taskId, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.task(taskId), context.previousTask);
      }
      if (context?.previousTaskDetails) {
        queryClient.setQueryData(queryKeys.taskDetails(taskId), context.previousTaskDetails);
      }
    },
    onSettled: (task, error, taskId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
      if (task) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(task.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentTaskId, data }: { parentTaskId: string; data: CreateSubtaskDto }) =>
      apiClient.createSubtask(parentTaskId, data),
    onSuccess: (_, { parentTaskId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(parentTaskId) });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// ============ TAG HOOKS ============

export function useTags(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.tags(workspaceId),
    queryFn: () => apiClient.getTags(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useTaskTags(taskId: string) {
  return useQuery({
    queryKey: queryKeys.taskTags(taskId),
    queryFn: () => apiClient.getTaskTags(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagDto) => apiClient.createTag(data),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(tag.workspaceId) });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagDto }) =>
      apiClient.updateTag(tagId, data),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags(tag.workspaceId) });
    },
  });
}

export function useAssignTagToTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, taskId }: { tagId: string; taskId: string }) =>
      apiClient.assignTagToTask(tagId, taskId),
    onSuccess: (_, { taskId }) => {
      // Invalidate task queries to update tag display
      queryClient.invalidateQueries({ queryKey: queryKeys.taskTags(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate all task lists

      // Invalidate tag queries to update task counts
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useRemoveTagFromTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, taskId }: { tagId: string; taskId: string }) =>
      apiClient.removeTagFromTask(tagId, taskId),
    onSuccess: (_, { taskId }) => {
      // Invalidate task queries to update tag display
      queryClient.invalidateQueries({ queryKey: queryKeys.taskTags(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate all task lists

      // Invalidate tag queries to update task counts
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => apiClient.deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

// ============ TIMER HOOKS ============

export function useActiveTimer() {
  return useQuery({
    queryKey: queryKeys.activeTimer,
    queryFn: () => apiClient.getActiveTimer(),
    refetchInterval: 1000, // Refetch every second for real-time updates
  });
}

export function useStartTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartTimerDto) => apiClient.startTimer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
    },
  });
}

export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StopTimerDto) => apiClient.stopTimer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function usePauseTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: { pauseStartedAt?: Date }) => apiClient.pauseTimer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
    },
  });
}

export function useResumeTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { pauseStartedAt: Date }) => apiClient.resumeTimer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
    },
  });
}

export function useSwitchTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { newTaskId: string; type?: string; splitReason?: string }) =>
      apiClient.switchTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['timer', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['timer', 'stats'] });
    },
  });
}

// Session History and Stats Hooks
export function useSessionHistory(params?: {
  taskId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  completedOnly?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.timerHistory(params),
    queryFn: () => apiClient.getSessionHistory(params),
  });
}

export function useTimerStats(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.timerStats(params),
    queryFn: () => apiClient.getTimerStats(params),
  });
}

export function useTaskTimeSessions(taskId: string) {
  return useQuery({
    queryKey: queryKeys.taskTimeSessions(taskId),
    queryFn: () => apiClient.getTaskTimeSessions(taskId),
    enabled: !!taskId,
  });
}

// ============ ANALYTICS HOOKS ============

export function useDailyMetrics(params?: GetDailyMetricsParams) {
  return useQuery({
    queryKey: queryKeys.dailyMetrics(params),
    queryFn: () => apiClient.getDailyMetrics(params),
  });
}

export function useWeeklyMetrics(params?: { weekStart?: string }) {
  return useQuery({
    queryKey: queryKeys.weeklyMetrics(params),
    queryFn: () => apiClient.getWeeklyMetrics(params),
  });
}

export function useMonthlyMetrics(params?: { monthStart?: string }) {
  return useQuery({
    queryKey: queryKeys.monthlyMetrics(params),
    queryFn: () => apiClient.getMonthlyMetrics(params),
  });
}

export function useDateRangeMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.dateRangeMetrics(startDate, endDate),
    queryFn: () => apiClient.getDateRangeMetrics(startDate, endDate),
  });
}

// ============ AI HOOKS ============

export function useAIProfile() {
  return useQuery({
    queryKey: queryKeys.aiProfile,
    queryFn: () => apiClient.getAIProfile(),
  });
}

export function useOptimalSchedule(params?: { topN?: number }) {
  return useQuery({
    queryKey: queryKeys.optimalSchedule(params),
    queryFn: () => apiClient.getOptimalSchedule(params),
  });
}

export function useTaskDurationPrediction(params?: { title?: string; description?: string; category?: string; priority?: string }) {
  return useQuery({
    queryKey: queryKeys.taskDurationPrediction(params),
    queryFn: () => apiClient.predictTaskDuration(params),
    enabled: !!params?.title || !!params?.description, // Only fetch if we have at least title or description
  });
}

// ============ AI REPORTS HOOKS ============

export function useGenerateWeeklyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weekStart?: string) => apiClient.generateWeeklyReport(weekStart),
    onSuccess: () => {
      // Invalidate reports list
      queryClient.invalidateQueries({ queryKey: queryKeys.reports() });
    },
  });
}

export function useReports(params?: { scope?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.reports(params),
    queryFn: () => apiClient.getReports(params),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.report(id),
    queryFn: () => apiClient.getReport(id),
    enabled: !!id,
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteReport(id),
    onSuccess: () => {
      // Invalidate reports list
      queryClient.invalidateQueries({ queryKey: queryKeys.reports() });
    },
  });
}

// ============ COMMENT HOOKS ============

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: queryKeys.taskComments(taskId),
    queryFn: () => apiClient.getTaskComments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentDto) => apiClient.createComment(data),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskComments(comment.taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(comment.taskId) });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentDto }) =>
      apiClient.updateComment(commentId, data),
    onSuccess: (comment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskComments(comment.taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(comment.taskId) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => apiClient.deleteComment(commentId),
    onSuccess: () => {
      // Invalidate all comment and task detail queries since we don't know which task it belonged to
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// ============ ATTACHMENT HOOKS ============

export function useTaskAttachments(taskId: string) {
  return useQuery({
    queryKey: queryKeys.taskAttachments(taskId),
    queryFn: () => apiClient.getTaskAttachments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttachmentDto) => apiClient.createAttachment(data),
    onSuccess: (attachment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.taskAttachments(attachment.taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(attachment.taskId) });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => apiClient.deleteAttachment(attachmentId),
    onSuccess: () => {
      // Invalidate all attachment queries since we don't know which task it belonged to
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}


