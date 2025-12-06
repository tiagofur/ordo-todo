/**
 * Shared React Query Hooks for Ordo-Todo
 *
 * This module provides factory functions to create React Query hooks
 * that can be used across web, mobile, and desktop applications.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  UpdateTagDto,
  StartTimerDto,
  StopTimerDto,
  GetDailyMetricsParams,
  CreateCommentDto,
  UpdateCommentDto,
  CreateAttachmentDto,
  InviteMemberDto,
  AcceptInvitationDto,
} from '@ordo-todo/api-client';
import { queryKeys } from './query-keys';
import type { ApiClient, CreateHooksConfig } from './types';

/**
 * Creates all React Query hooks bound to a specific API client.
 *
 * @example
 * ```tsx
 * // In your app's hooks file
 * import { createHooks } from '@ordo-todo/hooks';
 * import { apiClient } from './api-client';
 *
 * export const {
 *   useCurrentUser,
 *   useTasks,
 *   useCreateTask,
 *   // ... other hooks
 * } = createHooks({ apiClient });
 * ```
 */
export function createHooks(config: CreateHooksConfig) {
  const { apiClient } = config;

  // ============ AUTH HOOKS ============

  function useRegister() {
    return useMutation({
      mutationFn: (data: RegisterDto) => apiClient.register(data),
    });
  }

  function useLogin() {
    return useMutation({
      mutationFn: (data: LoginDto) => apiClient.login(data),
    });
  }

  function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: () => apiClient.logout(),
      onSuccess: () => {
        queryClient.clear();
      },
    });
  }

  // ============ USER HOOKS ============

  function useCurrentUser() {
    return useQuery({
      queryKey: queryKeys.currentUser,
      queryFn: () => apiClient.getCurrentUser(),
      retry: false,
    });
  }

  function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: UpdateProfileDto) => apiClient.updateProfile(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
        queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      },
    });
  }

  function useFullProfile() {
    return useQuery({
      queryKey: queryKeys.userProfile,
      queryFn: () => apiClient.getFullProfile(),
      retry: false,
    });
  }

  function useUserPreferences() {
    return useQuery({
      queryKey: queryKeys.userPreferences,
      queryFn: () => apiClient.getPreferences(),
      retry: false,
    });
  }

  function useUpdatePreferences() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: Parameters<typeof apiClient.updatePreferences>[0]) =>
        apiClient.updatePreferences(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.userPreferences });
        queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      },
    });
  }

  function useUserIntegrations() {
    return useQuery({
      queryKey: queryKeys.userIntegrations,
      queryFn: () => apiClient.getIntegrations(),
      retry: false,
    });
  }

  function useExportData() {
    return useMutation({
      mutationFn: () => apiClient.exportData(),
    });
  }

  function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: () => apiClient.deleteAccount(),
      onSuccess: () => {
        queryClient.clear();
      },
    });
  }

  // ============ WORKSPACE HOOKS ============

  function useWorkspaces() {
    return useQuery({
      queryKey: queryKeys.workspaces,
      queryFn: () => apiClient.getWorkspaces(),
    });
  }

  function useWorkspace(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspace(workspaceId),
      queryFn: () => apiClient.getWorkspace(workspaceId),
      enabled: !!workspaceId,
    });
  }

  function useWorkspaceBySlug(slug: string) {
    return useQuery({
      queryKey: ['workspaces', 'slug', slug],
      queryFn: () => apiClient.getWorkspaceBySlug(slug),
      enabled: !!slug,
    });
  }

  function useCreateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateWorkspaceDto) => apiClient.createWorkspace(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      },
    });
  }

  function useUpdateWorkspace() {
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

  function useDeleteWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (workspaceId: string) => apiClient.deleteWorkspace(workspaceId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      },
    });
  }

  function useAddWorkspaceMember() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ workspaceId, data }: { workspaceId: string; data: AddMemberDto }) =>
        apiClient.addWorkspaceMember(workspaceId, data),
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) });
      },
    });
  }

  function useRemoveWorkspaceMember() {
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

  function useWorkspaceMembers(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspaceMembers(workspaceId),
      queryFn: () => {
        if (!apiClient.getWorkspaceMembers) {
          throw new Error('getWorkspaceMembers not implemented in API client');
        }
        return apiClient.getWorkspaceMembers(workspaceId);
      },
      enabled: !!workspaceId && !!apiClient.getWorkspaceMembers,
    });
  }

  function useWorkspaceInvitations(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspaceInvitations(workspaceId),
      queryFn: () => {
        if (!apiClient.getWorkspaceInvitations) {
          throw new Error('getWorkspaceInvitations not implemented in API client');
        }
        return apiClient.getWorkspaceInvitations(workspaceId);
      },
      enabled: !!workspaceId && !!apiClient.getWorkspaceInvitations,
    });
  }

  function useInviteMember() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ workspaceId, data }: { workspaceId: string; data: InviteMemberDto }) => {
        if (!apiClient.inviteWorkspaceMember) {
          throw new Error('inviteWorkspaceMember not implemented in API client');
        }
        return apiClient.inviteWorkspaceMember(workspaceId, data);
      },
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceInvitations(workspaceId) });
      },
    });
  }

  function useAcceptInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: AcceptInvitationDto) => {
        if (!apiClient.acceptWorkspaceInvitation) {
          throw new Error('acceptWorkspaceInvitation not implemented in API client');
        }
        return apiClient.acceptWorkspaceInvitation(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      },
    });
  }

  function useWorkspaceSettings(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspaceSettings(workspaceId),
      queryFn: () => {
        if (!apiClient.getWorkspaceSettings) {
          throw new Error('getWorkspaceSettings not implemented in API client');
        }
        return apiClient.getWorkspaceSettings(workspaceId);
      },
      enabled: !!workspaceId && !!apiClient.getWorkspaceSettings,
    });
  }

  function useUpdateWorkspaceSettings() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        workspaceId,
        data,
      }: {
        workspaceId: string;
        data: {
          defaultView?: 'LIST' | 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'FOCUS';
          defaultDueTime?: number;
          timezone?: string;
          locale?: string;
        };
      }) => {
        if (!apiClient.updateWorkspaceSettings) {
          throw new Error('updateWorkspaceSettings not implemented in API client');
        }
        return apiClient.updateWorkspaceSettings(workspaceId, data);
      },
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSettings(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceAuditLogs(workspaceId) });
      },
    });
  }

  function useWorkspaceAuditLogs(workspaceId: string, params?: { limit?: number; offset?: number }) {
    return useQuery({
      queryKey: queryKeys.workspaceAuditLogs(workspaceId, params),
      queryFn: () => {
        if (!apiClient.getWorkspaceAuditLogs) {
          throw new Error('getWorkspaceAuditLogs not implemented in API client');
        }
        return apiClient.getWorkspaceAuditLogs(workspaceId, params);
      },
      enabled: !!workspaceId && !!apiClient.getWorkspaceAuditLogs,
    });
  }

  // ============ WORKFLOW HOOKS ============

  function useWorkflows(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workflows(workspaceId),
      queryFn: () => apiClient.getWorkflows(workspaceId),
      enabled: !!workspaceId,
    });
  }

  function useCreateWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateWorkflowDto) => apiClient.createWorkflow(data),
      onSuccess: (workflow) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workflows(workflow.workspaceId) });
      },
    });
  }

  function useUpdateWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ workflowId, data }: { workflowId: string; data: UpdateWorkflowDto }) =>
        apiClient.updateWorkflow(workflowId, data),
      onSuccess: (workflow) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workflows(workflow.workspaceId) });
      },
    });
  }

  function useDeleteWorkflow() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (workflowId: string) => apiClient.deleteWorkflow(workflowId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workflows'] });
      },
    });
  }

  // ============ PROJECT HOOKS ============

  function useProjects(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.projects(workspaceId),
      queryFn: () => apiClient.getProjects(workspaceId),
      enabled: !!workspaceId,
    });
  }

  function useAllProjects() {
    return useQuery({
      queryKey: queryKeys.allProjects,
      queryFn: () => apiClient.getAllProjects(),
    });
  }

  function useProject(projectId: string) {
    return useQuery({
      queryKey: queryKeys.project(projectId),
      queryFn: () => apiClient.getProject(projectId),
      enabled: !!projectId,
    });
  }

  function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateProjectDto) => apiClient.createProject(data),
      onSuccess: (project) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects(project.workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.allProjects });
      },
    });
  }

  function useUpdateProject() {
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

  function useArchiveProject() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (projectId: string) => apiClient.archiveProject(projectId),
      onSuccess: (project) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  }

  function useCompleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (projectId: string) => apiClient.completeProject(projectId),
      onSuccess: (project) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  }

  function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (projectId: string) => apiClient.deleteProject(projectId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  }

  // ============ TASK HOOKS ============

  function useTasks(projectId?: string, tags?: string[], options?: { assignedToMe?: boolean }) {
    return useQuery({
      queryKey: projectId
        ? ['tasks', projectId, { tags, assignedToMe: options?.assignedToMe }]
        : ['tasks', { tags, assignedToMe: options?.assignedToMe }],
      queryFn: () => apiClient.getTasks(projectId, tags),
    });
  }

  function useTask(taskId: string) {
    return useQuery({
      queryKey: queryKeys.task(taskId),
      queryFn: () => apiClient.getTask(taskId),
      enabled: !!taskId,
    });
  }

  function useTaskDetails(taskId: string) {
    return useQuery({
      queryKey: queryKeys.taskDetails(taskId),
      queryFn: () => apiClient.getTaskDetails(taskId),
      enabled: !!taskId,
    });
  }

  function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateTaskDto) => apiClient.createTask(data),
      onSuccess: (task) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks(task.projectId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
      },
    });
  }

  function useUpdateTask() {
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
          queryClient.setQueryData(queryKeys.task(taskId), (old: unknown) => ({
            ...(old as object),
            ...data,
          }));
        }

        if (previousTaskDetails) {
          queryClient.setQueryData(queryKeys.taskDetails(taskId), (old: unknown) => ({
            ...(old as object),
            ...data,
          }));
        }

        return { previousTask, previousTaskDetails };
      },
      onError: (_err, { taskId }, context) => {
        if (context?.previousTask) {
          queryClient.setQueryData(queryKeys.task(taskId), context.previousTask);
        }
        if (context?.previousTaskDetails) {
          queryClient.setQueryData(queryKeys.taskDetails(taskId), context.previousTaskDetails);
        }
      },
      onSettled: (_task, _error, { taskId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    });
  }

  function useCompleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (taskId: string) => apiClient.completeTask(taskId),
      onMutate: async (taskId) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.task(taskId) });
        await queryClient.cancelQueries({ queryKey: queryKeys.taskDetails(taskId) });

        const previousTask = queryClient.getQueryData(queryKeys.task(taskId));
        const previousTaskDetails = queryClient.getQueryData(queryKeys.taskDetails(taskId));

        if (previousTask) {
          queryClient.setQueryData(queryKeys.task(taskId), (old: unknown) => ({
            ...(old as object),
            status: 'COMPLETED',
          }));
        }

        if (previousTaskDetails) {
          queryClient.setQueryData(queryKeys.taskDetails(taskId), (old: unknown) => ({
            ...(old as object),
            status: 'COMPLETED',
          }));
        }

        return { previousTask, previousTaskDetails };
      },
      onError: (_err, taskId, context) => {
        if (context?.previousTask) {
          queryClient.setQueryData(queryKeys.task(taskId), context.previousTask);
        }
        if (context?.previousTaskDetails) {
          queryClient.setQueryData(queryKeys.taskDetails(taskId), context.previousTaskDetails);
        }
      },
      onSettled: (_task, _error, taskId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['dailyMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['timer', 'stats'] });
      },
    });
  }

  function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    });
  }

  function useCreateSubtask() {
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

  function useShareTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (taskId: string) => {
        if (!apiClient.generatePublicToken) {
          throw new Error('generatePublicToken not implemented in API client');
        }
        return apiClient.generatePublicToken(taskId);
      },
      onSuccess: (_data, taskId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
      },
    });
  }

  function usePublicTask(token: string) {
    return useQuery({
      queryKey: queryKeys.publicTask(token),
      queryFn: () => {
        if (!apiClient.getTaskByPublicToken) {
          throw new Error('getTaskByPublicToken not implemented in API client');
        }
        return apiClient.getTaskByPublicToken(token);
      },
      enabled: !!token && !!apiClient.getTaskByPublicToken,
    });
  }

  // ============ TAG HOOKS ============

  function useTags(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.tags(workspaceId),
      queryFn: () => apiClient.getTags(workspaceId),
      enabled: !!workspaceId,
    });
  }

  function useTaskTags(taskId: string) {
    return useQuery({
      queryKey: queryKeys.taskTags(taskId),
      queryFn: () => apiClient.getTaskTags(taskId),
      enabled: !!taskId,
    });
  }

  function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateTagDto) => apiClient.createTag(data),
      onSuccess: (tag) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tags(tag.workspaceId) });
      },
    });
  }

  function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagDto }) => {
        if (!apiClient.updateTag) {
          throw new Error('updateTag not implemented in API client');
        }
        return apiClient.updateTag(tagId, data);
      },
      onSuccess: (tag: { workspaceId: string }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.tags(tag.workspaceId) });
      },
    });
  }

  function useAssignTagToTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ tagId, taskId }: { tagId: string; taskId: string }) =>
        apiClient.assignTagToTask(tagId, taskId),
      onSuccess: (_, { taskId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.taskTags(taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['tags'] });
      },
    });
  }

  function useRemoveTagFromTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ tagId, taskId }: { tagId: string; taskId: string }) =>
        apiClient.removeTagFromTask(tagId, taskId),
      onSuccess: (_, { taskId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.taskTags(taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId) });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['tags'] });
      },
    });
  }

  function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (tagId: string) => apiClient.deleteTag(tagId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] });
      },
    });
  }

  // ============ TIMER HOOKS ============

  function useActiveTimer() {
    return useQuery({
      queryKey: queryKeys.activeTimer,
      queryFn: () => apiClient.getActiveTimer(),
      refetchInterval: 1000,
    });
  }

  function useStartTimer() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: StartTimerDto) => apiClient.startTimer(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    });
  }

  function useStopTimer() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: StopTimerDto) => apiClient.stopTimer(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['timer', 'history'] });
        queryClient.invalidateQueries({ queryKey: ['timer', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['dailyMetrics'] });
      },
    });
  }

  function usePauseTimer() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data?: { pauseStartedAt?: Date }) => apiClient.pauseTimer(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
      },
    });
  }

  function useResumeTimer() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: { pauseStartedAt: Date }) => apiClient.resumeTimer(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
      },
    });
  }

  function useSwitchTask() {
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

  function useSessionHistory(params?: {
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

  function useTimerStats(params?: { startDate?: string; endDate?: string }) {
    return useQuery({
      queryKey: queryKeys.timerStats(params),
      queryFn: () => apiClient.getTimerStats(params),
    });
  }

  function useTaskTimeSessions(taskId: string) {
    return useQuery({
      queryKey: queryKeys.taskTimeSessions(taskId),
      queryFn: () => apiClient.getTaskTimeSessions(taskId),
      enabled: !!taskId,
    });
  }

  // ============ ANALYTICS HOOKS ============

  function useDailyMetrics(params?: GetDailyMetricsParams) {
    return useQuery({
      queryKey: queryKeys.dailyMetrics(params),
      queryFn: () => apiClient.getDailyMetrics(params),
    });
  }

  function useWeeklyMetrics(params?: { weekStart?: string }) {
    return useQuery({
      queryKey: queryKeys.weeklyMetrics(params),
      queryFn: () => apiClient.getWeeklyMetrics(params),
    });
  }

  function useMonthlyMetrics(params?: { monthStart?: string }) {
    return useQuery({
      queryKey: queryKeys.monthlyMetrics(params),
      queryFn: () => {
        if (!apiClient.getMonthlyMetrics) {
          throw new Error('getMonthlyMetrics not implemented in API client');
        }
        return apiClient.getMonthlyMetrics(params);
      },
      enabled: !!apiClient.getMonthlyMetrics,
    });
  }

  function useDateRangeMetrics(startDate: string, endDate: string) {
    return useQuery({
      queryKey: queryKeys.dateRangeMetrics(startDate, endDate),
      queryFn: () => {
        if (!apiClient.getDateRangeMetrics) {
          throw new Error('getDateRangeMetrics not implemented in API client');
        }
        return apiClient.getDateRangeMetrics(startDate, endDate);
      },
      enabled: !!apiClient.getDateRangeMetrics,
    });
  }

  function useDashboardStats() {
    return useQuery({
      queryKey: queryKeys.dashboardStats,
      queryFn: () => apiClient.getDashboardStats(),
    });
  }

  function useHeatmapData() {
    return useQuery({
      queryKey: queryKeys.heatmapData,
      queryFn: () => apiClient.getHeatmapData(),
    });
  }

  function useProjectDistribution() {
    return useQuery({
      queryKey: queryKeys.projectDistribution,
      queryFn: () => apiClient.getProjectDistribution(),
    });
  }

  function useTaskStatusDistribution() {
    return useQuery({
      queryKey: queryKeys.taskStatusDistribution,
      queryFn: () => apiClient.getTaskStatusDistribution(),
    });
  }

  // ============ AI HOOKS ============

  function useAIProfile() {
    return useQuery({
      queryKey: queryKeys.aiProfile,
      queryFn: () => apiClient.getAIProfile(),
    });
  }

  function useOptimalSchedule(params?: { topN?: number }) {
    return useQuery({
      queryKey: queryKeys.optimalSchedule(params),
      queryFn: () => apiClient.getOptimalSchedule(params?.topN),
    });
  }

  function useTaskDurationPrediction(params?: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
  }) {
    return useQuery({
      queryKey: queryKeys.taskDurationPrediction(params),
      queryFn: () =>
        apiClient.predictTaskDuration(
          params as { title?: string; description?: string; category?: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }
        ),
      enabled: !!params?.title || !!params?.description,
    });
  }

  function useGenerateWeeklyReport() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (weekStart?: string) => apiClient.generateWeeklyReport(weekStart),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.reports() });
      },
    });
  }

  function useReports(params?: { scope?: string; limit?: number; offset?: number }) {
    return useQuery({
      queryKey: queryKeys.reports(params),
      queryFn: () => apiClient.getReports(params),
    });
  }

  function useReport(id: string) {
    return useQuery({
      queryKey: queryKeys.report(id),
      queryFn: () => apiClient.getReport(id),
      enabled: !!id,
    });
  }

  function useDeleteReport() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => apiClient.deleteReport(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.reports() });
      },
    });
  }

  // ============ COMMENT HOOKS ============

  function useTaskComments(taskId: string) {
    return useQuery({
      queryKey: queryKeys.taskComments(taskId),
      queryFn: () => apiClient.getTaskComments(taskId),
      enabled: !!taskId,
    });
  }

  function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateCommentDto) => apiClient.createComment(data),
      onSuccess: (comment) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.taskComments(comment.taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(comment.taskId) });
      },
    });
  }

  function useUpdateComment() {
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

  function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (commentId: string) => apiClient.deleteComment(commentId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      },
    });
  }

  // ============ ATTACHMENT HOOKS ============

  function useTaskAttachments(taskId: string) {
    return useQuery({
      queryKey: queryKeys.taskAttachments(taskId),
      queryFn: () => apiClient.getTaskAttachments(taskId),
      enabled: !!taskId,
    });
  }

  function useCreateAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateAttachmentDto) => apiClient.createAttachment(data),
      onSuccess: (attachment) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.taskAttachments(attachment.taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(attachment.taskId) });
      },
    });
  }

  function useDeleteAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (attachmentId: string) => apiClient.deleteAttachment(attachmentId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  }

  function useProjectAttachments(projectId: string) {
    return useQuery({
      queryKey: queryKeys.projectAttachments(projectId),
      queryFn: () => {
        if (!apiClient.getProjectAttachments) {
          throw new Error('getProjectAttachments not implemented in API client');
        }
        return apiClient.getProjectAttachments(projectId);
      },
      enabled: !!projectId && !!apiClient.getProjectAttachments,
    });
  }

  // ============ NOTIFICATION HOOKS ============

  function useNotifications() {
    return useQuery({
      queryKey: queryKeys.notifications,
      queryFn: () => {
        if (!apiClient.getNotifications) {
          throw new Error('getNotifications not implemented in API client');
        }
        return apiClient.getNotifications();
      },
      refetchInterval: 30000,
      enabled: !!apiClient.getNotifications,
    });
  }

  function useUnreadNotificationsCount() {
    return useQuery({
      queryKey: queryKeys.unreadNotificationsCount,
      queryFn: () => {
        if (!apiClient.getUnreadNotificationsCount) {
          throw new Error('getUnreadNotificationsCount not implemented in API client');
        }
        return apiClient.getUnreadNotificationsCount();
      },
      refetchInterval: 30000,
      enabled: !!apiClient.getUnreadNotificationsCount,
    });
  }

  function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) => {
        if (!apiClient.markNotificationAsRead) {
          throw new Error('markNotificationAsRead not implemented in API client');
        }
        return apiClient.markNotificationAsRead(id);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });
  }

  function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: () => {
        if (!apiClient.markAllNotificationsAsRead) {
          throw new Error('markAllNotificationsAsRead not implemented in API client');
        }
        return apiClient.markAllNotificationsAsRead();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });
  }

  // ============ UTILITY FUNCTIONS ============

  /**
   * Helper to invalidate all task queries
   */
  function invalidateAllTasks(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }

  // Return all hooks
  return {
    // Auth
    useRegister,
    useLogin,
    useLogout,

    // User
    useCurrentUser,
    useUpdateProfile,
    useFullProfile,
    useUserPreferences,
    useUpdatePreferences,
    useUserIntegrations,
    useExportData,
    useDeleteAccount,

    // Workspace
    useWorkspaces,
    useWorkspace,
    useWorkspaceBySlug,
    useCreateWorkspace,
    useUpdateWorkspace,
    useDeleteWorkspace,
    useAddWorkspaceMember,
    useRemoveWorkspaceMember,
    useWorkspaceMembers,
    useWorkspaceInvitations,
    useInviteMember,
    useAcceptInvitation,
    useWorkspaceSettings,
    useUpdateWorkspaceSettings,
    useWorkspaceAuditLogs,

    // Workflow
    useWorkflows,
    useCreateWorkflow,
    useUpdateWorkflow,
    useDeleteWorkflow,

    // Project
    useProjects,
    useAllProjects,
    useProject,
    useCreateProject,
    useUpdateProject,
    useArchiveProject,
    useCompleteProject,
    useDeleteProject,

    // Task
    useTasks,
    useTask,
    useTaskDetails,
    useCreateTask,
    useUpdateTask,
    useCompleteTask,
    useDeleteTask,
    useCreateSubtask,
    useShareTask,
    usePublicTask,

    // Tag
    useTags,
    useTaskTags,
    useCreateTag,
    useUpdateTag,
    useAssignTagToTask,
    useRemoveTagFromTask,
    useDeleteTag,

    // Timer
    useActiveTimer,
    useStartTimer,
    useStopTimer,
    usePauseTimer,
    useResumeTimer,
    useSwitchTask,
    useSessionHistory,
    useTimerStats,
    useTaskTimeSessions,

    // Analytics
    useDailyMetrics,
    useWeeklyMetrics,
    useMonthlyMetrics,
    useDateRangeMetrics,
    useDashboardStats,
    useHeatmapData,
    useProjectDistribution,
    useTaskStatusDistribution,

    // AI
    useAIProfile,
    useOptimalSchedule,
    useTaskDurationPrediction,
    useGenerateWeeklyReport,
    useReports,
    useReport,
    useDeleteReport,

    // Comments
    useTaskComments,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,

    // Attachments
    useTaskAttachments,
    useCreateAttachment,
    useDeleteAttachment,
    useProjectAttachments,

    // Notifications
    useNotifications,
    useUnreadNotificationsCount,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,

    // Utilities
    invalidateAllTasks,
  };
}

/**
 * Type for the hooks object returned by createHooks
 */
export type Hooks = ReturnType<typeof createHooks>;
