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
  GetSessionsParams,
  GetDailyMetricsParams,
  CreateCommentDto,
  UpdateCommentDto,
  CreateAttachmentDto,
  InviteMemberDto,
  AcceptInvitationDto,
  // Habits
  CreateHabitDto,
  UpdateHabitDto,
  CompleteHabitDto,
  // Objectives
  CreateObjectiveDto,
  UpdateObjectiveDto,
  CreateKeyResultDto,
  UpdateKeyResultDto,
  LinkTaskDto,
  // Custom Fields
  CreateCustomFieldDto,
  UpdateCustomFieldDto,

  SetMultipleCustomFieldValuesDto,
  // Notes
  Note,
  CreateNoteDto,
  UpdateNoteDto,
} from '@ordo-todo/api-client';

import { queryKeys } from './query-keys';
import type { ApiClient, CreateHooksConfig } from './types';
import { createNotesHooks } from './notes/use-notes';

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

  /**
   * Retrieves the currently authenticated user.
   * Cached with `currentUser` query key.
   * @param options - Optional query options including `enabled` to control when query runs
   * @returns The current user profile or null if not authenticated.
   */
  function useCurrentUser(options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: queryKeys.currentUser,
      queryFn: () => apiClient.getCurrentUser(),
      retry: false,
      enabled: options?.enabled ?? true,
    });
  }

  /**
   * Updates the user's profile information.
   * Invalidates `currentUser` and `userProfile` queries on success.
   */
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

  /**
   * Retrieves all workspaces the user is a member of.
   * @param options - Optional query options including `enabled` to control when query runs
   * @returns A list of workspaces.
   */
  function useWorkspaces(options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: queryKeys.workspaces,
      queryFn: () => apiClient.getWorkspaces(),
      enabled: options?.enabled ?? true,
    });
  }

  function useWorkspace(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspace(workspaceId),
      queryFn: () => apiClient.getWorkspace(workspaceId),
      enabled: !!workspaceId,
    });
  }

  function useWorkspaceBySlug(username: string, slug: string) {
    return useQuery({
      queryKey: ['workspaces', 'slug', username, slug],
      queryFn: () => apiClient.getWorkspaceBySlug(username, slug),
      enabled: !!username && !!slug,
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

  function useDeletedWorkspaces() {
    return useQuery({
      queryKey: queryKeys.deletedWorkspaces,
      queryFn: () => apiClient.getDeletedWorkspaces(),
    });
  }

  function useRestoreWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (workspaceId: string) => apiClient.restoreWorkspace(workspaceId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
        queryClient.invalidateQueries({ queryKey: queryKeys.deletedWorkspaces });
      },
    });
  }

  function usePermanentDeleteWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (workspaceId: string) => apiClient.permanentDeleteWorkspace(workspaceId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.deletedWorkspaces });
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

  function useChangeWorkspaceMemberRole() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        workspaceId,
        userId,
        role,
      }: {
        workspaceId: string;
        userId: string;
        role: "ADMIN" | "MEMBER" | "VIEWER";
      }) => apiClient.changeWorkspaceMemberRole(workspaceId, userId, role),
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceMembers(workspaceId) });
      },
    });
  }

  function useCancelWorkspaceInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ workspaceId, invitationId }: { workspaceId: string; invitationId: string }) =>
        apiClient.cancelWorkspaceInvitation(workspaceId, invitationId),
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceInvitations(workspaceId) });
      },
    });
  }

  function useLeaveWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ workspaceId }: { workspaceId: string }) =>
        apiClient.leaveWorkspace(workspaceId),
      onSuccess: () => {
        // ['workspaces'] is a prefix of every workspace query key (detail,
        // members, invitations) — invalidates all of them in one call
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      },
    });
  }

  function useWorkspaceMembers(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspaceMembers(workspaceId),
      queryFn: () => apiClient.getWorkspaceMembers(workspaceId),
      enabled: !!workspaceId,
    });
  }

  function useWorkspaceInvitations(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspaceInvitations(workspaceId),
      queryFn: () => apiClient.getWorkspaceInvitations(workspaceId),
      enabled: !!workspaceId,
    });
  }

  function useInviteMember() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ workspaceId, data }: { workspaceId: string; data: InviteMemberDto }) =>
        apiClient.inviteWorkspaceMember(workspaceId, data),
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceInvitations(workspaceId) });
      },
    });
  }

  function useAcceptInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: AcceptInvitationDto) =>
        apiClient.acceptWorkspaceInvitation(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
      },
    });
  }

  function useWorkspaceSettings(workspaceId: string) {
    return useQuery({
      queryKey: queryKeys.workspaceSettings(workspaceId),
      queryFn: () => apiClient.getWorkspaceSettings(workspaceId),
      enabled: !!workspaceId,
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
      }) =>
        apiClient.updateWorkspaceSettings(workspaceId, data),
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceSettings(workspaceId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceAuditLogs(workspaceId) });
      },
    });
  }

  function useWorkspaceAuditLogs(workspaceId: string, params?: { limit?: number; offset?: number }) {
    return useQuery({
      queryKey: queryKeys.workspaceAuditLogs(workspaceId, params),
      queryFn: () => apiClient.getWorkspaceAuditLogs(workspaceId, params),
      enabled: !!workspaceId,
    });
  }

  function useCreateAuditLog() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        workspaceId,
        action,
        payload,
      }: {
        workspaceId: string;
        action: string;
        payload?: Record<string, unknown>;
      }) =>
        apiClient.createAuditLog(workspaceId, action, payload),
      onSuccess: (_, { workspaceId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceAuditLogs(workspaceId) });
      },
    });
  }

  function useArchiveWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (workspaceId: string) =>
        apiClient.archiveWorkspace(workspaceId),
      onSuccess: (_, workspaceId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
        queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceId) });
      },
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allWorkflows });
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

  function useProjectBySlugs(workspaceSlug: string, projectSlug: string) {
    return useQuery({
      queryKey: queryKeys.projectBySlugs(workspaceSlug, projectSlug),
      queryFn: () => apiClient.getProjectBySlugs(workspaceSlug, projectSlug),
      enabled: !!workspaceSlug && !!projectSlug,
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allProjectsPrefix });
      },
    });
  }

  function useCompleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (projectId: string) => apiClient.completeProject(projectId),
      onSuccess: (project) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.project(project.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.allProjectsPrefix });
      },
    });
  }

  function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (projectId: string) => apiClient.deleteProject(projectId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allProjectsPrefix });
      },
    });
  }

  // ============ TASK HOOKS ============

  function useTasks(
    projectId?: string,
    tags?: string[],
    options?: { assignedToMe?: boolean; withoutProject?: boolean },
  ) {
    return useQuery({
      queryKey: queryKeys.tasks(
        projectId,
        tags,
        options?.assignedToMe,
        options?.withoutProject,
      ),
      queryFn: () =>
        apiClient.getTasks(
          projectId,
          tags,
          options?.assignedToMe,
          options?.withoutProject,
        ),
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
      onSuccess: () => {
        // La clave genérica ['tasks'] cubre por prefijo la lista del proyecto
        // y la de tareas express (projectId null, ODD 021)
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTimeBlocks });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTimerStats });
      },
    });
  }

  function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
      },
    });
  }

  function useShareTask() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (taskId: string) =>
        apiClient.generatePublicToken(taskId),
      onSuccess: (_data, taskId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
      },
    });
  }

  function usePublicTask(token: string) {
    return useQuery({
      queryKey: queryKeys.publicTask(token),
      queryFn: () => apiClient.getTaskByPublicToken(token),
      enabled: !!token,
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
      onSuccess: (tag: { workspaceId?: string }) => {
        if (tag.workspaceId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.tags(tag.workspaceId) });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.allTags });
      },
    });
  }

  function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ tagId, data }: { tagId: string; data: UpdateTagDto }): Promise<{ workspaceId?: string }> =>
        apiClient.updateTag(tagId, data) as Promise<{ workspaceId?: string }>,
      onSuccess: (tag) => {
        if (tag.workspaceId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.tags(tag.workspaceId) });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.allTags });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTags });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTags });
      },
    });
  }

  function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (tagId: string) => apiClient.deleteTag(tagId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allTags });
      },
    });
  }

  // ============ TIMER HOOKS ============

  function useActiveTimer() {
    return useQuery({
      queryKey: queryKeys.activeTimer,
      queryFn: () => apiClient.getActiveTimer(),
    });
  }

  function useStartTimer() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: StartTimerDto) => apiClient.startTimer(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
      },
    });
  }

  function useStopTimer() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: StopTimerDto) => apiClient.stopTimer(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activeTimer });
        queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTimerHistory });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTimerStats });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTimerHistory });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTimerStats });
      },
    });
  }

  function useSessionHistory(params?: GetSessionsParams) {
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
      queryFn: () => apiClient.getMonthlyMetrics(params),
    });
  }

  function useDateRangeMetrics(startDate: string, endDate: string) {
    return useQuery({
      queryKey: queryKeys.dateRangeMetrics(startDate, endDate),
      queryFn: () => apiClient.getDateRangeMetrics(startDate, endDate),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
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
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.allProjectsPrefix });
      },
    });
  }

  function useProjectAttachments(projectId: string) {
    return useQuery({
      queryKey: queryKeys.projectAttachments(projectId),
      queryFn: () => apiClient.getProjectAttachments(projectId),
      enabled: !!projectId,
    });
  }

  // ============ NOTIFICATION HOOKS ============

  function useNotifications() {
    return useQuery({
      queryKey: queryKeys.notifications,
      queryFn: () => apiClient.getNotifications(),
      refetchInterval: 30000,
    });
  }

  function useUnreadNotificationsCount() {
    return useQuery({
      queryKey: queryKeys.unreadNotificationsCount,
      queryFn: () => apiClient.getUnreadNotificationsCount(),
      refetchInterval: 30000,
    });
  }

  function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (id: string) =>
        apiClient.markNotificationAsRead(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      },
    });
  }

  function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: () =>
        apiClient.markAllNotificationsAsRead(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      },
    });
  }

  // ============ UTILITY FUNCTIONS ============

  /**
   * Helper to invalidate all task queries
   */
  function invalidateAllTasks(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
  }

  function useTimeBlocks(start?: Date | string, end?: Date | string) {
    return useQuery({
      queryKey: queryKeys.timeBlocks(
        start instanceof Date ? start.toISOString() : start,
        end instanceof Date ? end.toISOString() : end
      ),
      queryFn: () => apiClient.getTimeBlocks(start, end),
    });
  }

  // ============ HABIT HOOKS ============

  function useHabits(includeArchived?: boolean) {
    return useQuery({
      queryKey: [...queryKeys.habits, { includeArchived }],
      queryFn: () => apiClient.getHabits(includeArchived),
    });
  }

  function useTodayHabits() {
    return useQuery({
      queryKey: queryKeys.todayHabits,
      queryFn: () => apiClient.getTodayHabits(),
    });
  }

  function useHabit(habitId: string) {
    return useQuery({
      queryKey: queryKeys.habit(habitId),
      queryFn: () => apiClient.getHabit(habitId),
      enabled: !!habitId,
    });
  }

  function useHabitStats(habitId: string) {
    return useQuery({
      queryKey: queryKeys.habitStats(habitId),
      queryFn: () => apiClient.getHabitStats(habitId),
      enabled: !!habitId,
    });
  }

  function useCreateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateHabitDto) => apiClient.createHabit(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.habits });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayHabits });
      },
    });
  }

  function useUpdateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ habitId, data }: { habitId: string; data: UpdateHabitDto }) =>
        apiClient.updateHabit(habitId, data),
      onSuccess: (_, { habitId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.habit(habitId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.habits });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayHabits });
      },
    });
  }

  function useDeleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (habitId: string) => apiClient.deleteHabit(habitId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.habits });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayHabits });
      },
    });
  }

  function useCompleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ habitId, data }: { habitId: string; data?: CompleteHabitDto }) =>
        apiClient.completeHabit(habitId, data),
      onSuccess: (_, { habitId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.habit(habitId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.habitStats(habitId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.habits });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayHabits });
        // Invalidate user profile for XP updates
        queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
        queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      },
    });
  }

  function useUncompleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (habitId: string) => apiClient.uncompleteHabit(habitId),
      onSuccess: (_, habitId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.habit(habitId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.habitStats(habitId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.habits });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayHabits });
      },
    });
  }

  function usePauseHabit() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (habitId: string) => apiClient.pauseHabit(habitId),
      onSuccess: (_, habitId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.habit(habitId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.habits });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayHabits });
      },
    });
  }

  function useResumeHabit() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (habitId: string) => apiClient.resumeHabit(habitId),
      onSuccess: (_, habitId) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.habit(habitId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.habits });
        queryClient.invalidateQueries({ queryKey: queryKeys.todayHabits });
      },
    });
  }

  // ============ OBJECTIVES (OKRs) HOOKS ============

  function useObjectives(options?: { status?: string; workspaceId?: string }) {
    return useQuery({
      queryKey: queryKeys.objectives(options),
      queryFn: () => apiClient.getObjectives(options),
    });
  }

  function useCurrentPeriodObjectives() {
    return useQuery({
      queryKey: queryKeys.currentPeriodObjectives,
      queryFn: () => apiClient.getCurrentPeriodObjectives(),
    });
  }

  function useObjectivesDashboard() {
    return useQuery({
      queryKey: queryKeys.objectivesDashboard,
      queryFn: () => apiClient.getObjectivesDashboardSummary(),
    });
  }

  function useObjective(objectiveId: string) {
    return useQuery({
      queryKey: queryKeys.objective(objectiveId),
      queryFn: () => apiClient.getObjective(objectiveId),
      enabled: !!objectiveId,
    });
  }

  function useCreateObjective() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: CreateObjectiveDto) => apiClient.createObjective(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  function useUpdateObjective() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ objectiveId, data }: { objectiveId: string; data: UpdateObjectiveDto }) =>
        apiClient.updateObjective(objectiveId, data),
      onSuccess: (_, { objectiveId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.objective(objectiveId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  function useDeleteObjective() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (objectiveId: string) => apiClient.deleteObjective(objectiveId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  function useAddKeyResult() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ objectiveId, data }: { objectiveId: string; data: CreateKeyResultDto }) =>
        apiClient.addKeyResult(objectiveId, data),
      onSuccess: (_, { objectiveId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.objective(objectiveId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  function useUpdateKeyResult() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ keyResultId, data }: { keyResultId: string; data: UpdateKeyResultDto }) =>
        apiClient.updateKeyResult(keyResultId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  function useDeleteKeyResult() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (keyResultId: string) => apiClient.deleteKeyResult(keyResultId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  function useLinkTaskToKeyResult() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ keyResultId, data }: { keyResultId: string; data: LinkTaskDto }) =>
        apiClient.linkTaskToKeyResult(keyResultId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  function useUnlinkTaskFromKeyResult() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ keyResultId, taskId }: { keyResultId: string; taskId: string }) =>
        apiClient.unlinkTaskFromKeyResult(keyResultId, taskId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.allObjectives });
      },
    });
  }

  // ==================== Custom Fields ====================

  function useCustomFields(projectId: string) {
    return useQuery({
      queryKey: queryKeys.customFields(projectId),
      queryFn: () => apiClient.getProjectCustomFields(projectId),
      enabled: !!projectId,
    });
  }

  function useCreateCustomField() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ projectId, data }: { projectId: string; data: CreateCustomFieldDto }) =>
        apiClient.createCustomField(projectId, data),
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.customFields(projectId) });
      },
    });
  }

  function useUpdateCustomField() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ fieldId, data, projectId }: { fieldId: string; data: UpdateCustomFieldDto; projectId: string }) =>
        apiClient.updateCustomField(fieldId, data),
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.customFields(projectId) });
      },
    });
  }

  function useDeleteCustomField() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ fieldId, projectId }: { fieldId: string; projectId: string }) =>
        apiClient.deleteCustomField(fieldId),
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.customFields(projectId) });
      },
    });
  }

  function useTaskCustomValues(taskId: string) {
    return useQuery({
      queryKey: queryKeys.taskCustomValues(taskId),
      queryFn: () => apiClient.getTaskCustomValues(taskId),
      enabled: !!taskId,
    });
  }

  function useSetTaskCustomValues() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ taskId, data }: { taskId: string; data: SetMultipleCustomFieldValuesDto }) =>
        apiClient.setTaskCustomValues(taskId, data),
      onSuccess: (_, { taskId }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.taskCustomValues(taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.allTasks });
      },
    });
  }

  // ============ NOTES HOOKS ============

  const {
    useNotes,
    useNote,
    useCreateNote,
    useUpdateNote,
    useDeleteNote
  } = createNotesHooks(apiClient);

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
    useDeletedWorkspaces,
    useRestoreWorkspace,
    usePermanentDeleteWorkspace,
    useArchiveWorkspace,
    useAddWorkspaceMember,
    useRemoveWorkspaceMember,
    useChangeWorkspaceMemberRole,
    useCancelWorkspaceInvitation,
    useLeaveWorkspace,
    useWorkspaceMembers,
    useWorkspaceInvitations,
    useInviteMember,
    useAcceptInvitation,
    useWorkspaceSettings,
    useUpdateWorkspaceSettings,
    useWorkspaceAuditLogs,
    useCreateAuditLog,

    // Workflow
    useWorkflows,
    useCreateWorkflow,
    useUpdateWorkflow,
    useDeleteWorkflow,

    // Project
    useProjects,
    useAllProjects,
    useProject,
    useProjectBySlugs,
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

    // Time Blocking
    useTimeBlocks,

    // Habits
    useHabits,
    useTodayHabits,
    useHabit,
    useHabitStats,
    useCreateHabit,
    useUpdateHabit,
    useDeleteHabit,
    useCompleteHabit,
    useUncompleteHabit,
    usePauseHabit,
    useResumeHabit,

    // Objectives (OKRs)
    useObjectives,
    useCurrentPeriodObjectives,
    useObjectivesDashboard,
    useObjective,
    useCreateObjective,
    useUpdateObjective,
    useDeleteObjective,
    useAddKeyResult,
    useUpdateKeyResult,
    useDeleteKeyResult,
    useLinkTaskToKeyResult,
    useUnlinkTaskFromKeyResult,

    // Custom Fields
    useCustomFields,
    useCreateCustomField,
    useUpdateCustomField,
    useDeleteCustomField,
    useTaskCustomValues,
    useSetTaskCustomValues,

    // Notes
    useNotes,
    useNote,
    useCreateNote,
    useUpdateNote,
    useDeleteNote,

    // Utilities

    invalidateAllTasks,
  };
}

/**
 * Type for the hooks object returned by createHooks
 */
export type Hooks = ReturnType<typeof createHooks>;
