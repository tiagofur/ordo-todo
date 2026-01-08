/**
 * Shared React Query Hooks for Ordo-Todo
 *
 * This module provides factory functions to create React Query hooks
 * that can be used across web, mobile, and desktop applications.
 */
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHooks = createHooks;
const react_query_1 = require("@tanstack/react-query");
const query_keys_1 = require("./query-keys");
const use_notes_1 = require("./notes/use-notes");
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
function createHooks(config) {
    const { apiClient } = config;
    // ============ AUTH HOOKS ============
    function useRegister() {
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.register(data),
        });
    }
    function useLogin() {
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.login(data),
        });
    }
    function useLogout() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
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
     * @returns The current user profile or null if not authenticated.
     */
    function useCurrentUser() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.currentUser,
            queryFn: () => apiClient.getCurrentUser(),
            retry: false,
        });
    }
    /**
     * Updates the user's profile information.
     * Invalidates `currentUser` and `userProfile` queries on success.
     */
    function useUpdateProfile() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.updateProfile(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.currentUser });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.userProfile });
            },
        });
    }
    function useFullProfile() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.userProfile,
            queryFn: () => apiClient.getFullProfile(),
            retry: false,
        });
    }
    function useUserPreferences() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.userPreferences,
            queryFn: () => apiClient.getPreferences(),
            retry: false,
        });
    }
    function useUpdatePreferences() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.updatePreferences(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.userPreferences });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.userProfile });
            },
        });
    }
    function useUserIntegrations() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.userIntegrations,
            queryFn: () => apiClient.getIntegrations(),
            retry: false,
        });
    }
    function useExportData() {
        return (0, react_query_1.useMutation)({
            mutationFn: () => apiClient.exportData(),
        });
    }
    function useDeleteAccount() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: () => apiClient.deleteAccount(),
            onSuccess: () => {
                queryClient.clear();
            },
        });
    }
    // ============ WORKSPACE HOOKS ============
    /**
     * Retrieves all workspaces the user is a member of.
     * @returns A list of workspaces.
     */
    function useWorkspaces() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.workspaces,
            queryFn: () => apiClient.getWorkspaces(),
        });
    }
    function useWorkspace(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.workspace(workspaceId),
            queryFn: () => apiClient.getWorkspace(workspaceId),
            enabled: !!workspaceId,
        });
    }
    function useWorkspaceBySlug(username, slug) {
        return (0, react_query_1.useQuery)({
            queryKey: ['workspaces', 'slug', username, slug],
            queryFn: () => apiClient.getWorkspaceBySlug(username, slug),
            enabled: !!username && !!slug,
        });
    }
    function useCreateWorkspace() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createWorkspace(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaces });
            },
        });
    }
    function useUpdateWorkspace() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ workspaceId, data }) => apiClient.updateWorkspace(workspaceId, data),
            onSuccess: (_, { workspaceId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspace(workspaceId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaces });
            },
        });
    }
    function useDeleteWorkspace() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (workspaceId) => apiClient.deleteWorkspace(workspaceId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaces });
            },
        });
    }
    function useDeletedWorkspaces() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.deletedWorkspaces,
            queryFn: () => apiClient.getDeletedWorkspaces(),
        });
    }
    function useRestoreWorkspace() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (workspaceId) => apiClient.restoreWorkspace(workspaceId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaces });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.deletedWorkspaces });
            },
        });
    }
    function usePermanentDeleteWorkspace() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (workspaceId) => apiClient.permanentDeleteWorkspace(workspaceId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.deletedWorkspaces });
            },
        });
    }
    function useAddWorkspaceMember() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ workspaceId, data }) => apiClient.addWorkspaceMember(workspaceId, data),
            onSuccess: (_, { workspaceId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspace(workspaceId) });
            },
        });
    }
    function useRemoveWorkspaceMember() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ workspaceId, userId }) => apiClient.removeWorkspaceMember(workspaceId, userId),
            onSuccess: (_, { workspaceId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspace(workspaceId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaceMembers(workspaceId) });
            },
        });
    }
    function useWorkspaceMembers(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.workspaceMembers(workspaceId),
            queryFn: () => {
                if (!apiClient.getWorkspaceMembers) {
                    throw new Error('getWorkspaceMembers not implemented in API client');
                }
                return apiClient.getWorkspaceMembers(workspaceId);
            },
            enabled: !!workspaceId && !!apiClient.getWorkspaceMembers,
        });
    }
    function useWorkspaceInvitations(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.workspaceInvitations(workspaceId),
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
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ workspaceId, data }) => {
                if (!apiClient.inviteWorkspaceMember) {
                    throw new Error('inviteWorkspaceMember not implemented in API client');
                }
                return apiClient.inviteWorkspaceMember(workspaceId, data);
            },
            onSuccess: (_, { workspaceId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaceInvitations(workspaceId) });
            },
        });
    }
    function useAcceptInvitation() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => {
                if (!apiClient.acceptWorkspaceInvitation) {
                    throw new Error('acceptWorkspaceInvitation not implemented in API client');
                }
                return apiClient.acceptWorkspaceInvitation(data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaces });
            },
        });
    }
    function useWorkspaceSettings(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.workspaceSettings(workspaceId),
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
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ workspaceId, data, }) => {
                if (!apiClient.updateWorkspaceSettings) {
                    throw new Error('updateWorkspaceSettings not implemented in API client');
                }
                return apiClient.updateWorkspaceSettings(workspaceId, data);
            },
            onSuccess: (_, { workspaceId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaceSettings(workspaceId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaceAuditLogs(workspaceId) });
            },
        });
    }
    function useWorkspaceAuditLogs(workspaceId, params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.workspaceAuditLogs(workspaceId, params),
            queryFn: () => {
                if (!apiClient.getWorkspaceAuditLogs) {
                    throw new Error('getWorkspaceAuditLogs not implemented in API client');
                }
                return apiClient.getWorkspaceAuditLogs(workspaceId, params);
            },
            enabled: !!workspaceId && !!apiClient.getWorkspaceAuditLogs,
        });
    }
    function useCreateAuditLog() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ workspaceId, action, payload, }) => {
                if (!apiClient.createAuditLog) {
                    throw new Error('createAuditLog not implemented in API client');
                }
                return apiClient.createAuditLog(workspaceId, action, payload);
            },
            onSuccess: (_, { workspaceId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaceAuditLogs(workspaceId) });
            },
        });
    }
    function useArchiveWorkspace() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (workspaceId) => {
                if (!apiClient.archiveWorkspace) {
                    throw new Error('archiveWorkspace not implemented in API client');
                }
                return apiClient.archiveWorkspace(workspaceId);
            },
            onSuccess: (_, workspaceId) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspaces });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workspace(workspaceId) });
            },
        });
    }
    // ============ WORKFLOW HOOKS ============
    function useWorkflows(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.workflows(workspaceId),
            queryFn: () => apiClient.getWorkflows(workspaceId),
            enabled: !!workspaceId,
        });
    }
    function useCreateWorkflow() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createWorkflow(data),
            onSuccess: (workflow) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workflows(workflow.workspaceId) });
            },
        });
    }
    function useUpdateWorkflow() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ workflowId, data }) => apiClient.updateWorkflow(workflowId, data),
            onSuccess: (workflow) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.workflows(workflow.workspaceId) });
            },
        });
    }
    function useDeleteWorkflow() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (workflowId) => apiClient.deleteWorkflow(workflowId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['workflows'] });
            },
        });
    }
    // ============ PROJECT HOOKS ============
    function useProjects(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.projects(workspaceId),
            queryFn: () => apiClient.getProjects(workspaceId),
            enabled: !!workspaceId,
        });
    }
    function useAllProjects() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.allProjects,
            queryFn: () => apiClient.getAllProjects(),
        });
    }
    function useProject(projectId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.project(projectId),
            queryFn: () => apiClient.getProject(projectId),
            enabled: !!projectId,
        });
    }
    function useProjectBySlugs(workspaceSlug, projectSlug) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.projectBySlugs(workspaceSlug, projectSlug),
            queryFn: () => apiClient.getProjectBySlugs(workspaceSlug, projectSlug),
            enabled: !!workspaceSlug && !!projectSlug,
        });
    }
    function useCreateProject() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createProject(data),
            onSuccess: (project) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.projects(project.workspaceId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.allProjects });
            },
        });
    }
    function useUpdateProject() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ projectId, data }) => apiClient.updateProject(projectId, data),
            onSuccess: (project) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.project(project.id) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.projects(project.workspaceId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.allProjects });
            },
        });
    }
    function useArchiveProject() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (projectId) => apiClient.archiveProject(projectId),
            onSuccess: (project) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.project(project.id) });
                queryClient.invalidateQueries({ queryKey: ['projects'] });
            },
        });
    }
    function useCompleteProject() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (projectId) => apiClient.completeProject(projectId),
            onSuccess: (project) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.project(project.id) });
                queryClient.invalidateQueries({ queryKey: ['projects'] });
            },
        });
    }
    function useDeleteProject() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (projectId) => apiClient.deleteProject(projectId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['projects'] });
            },
        });
    }
    // ============ TASK HOOKS ============
    function useTasks(projectId, tags, options) {
        return (0, react_query_1.useQuery)({
            queryKey: projectId
                ? ['tasks', projectId, { tags, assignedToMe: options?.assignedToMe }]
                : ['tasks', { tags, assignedToMe: options?.assignedToMe }],
            queryFn: () => apiClient.getTasks(projectId, tags),
        });
    }
    function useTask(taskId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.task(taskId),
            queryFn: () => apiClient.getTask(taskId),
            enabled: !!taskId,
        });
    }
    function useTaskDetails(taskId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskDetails(taskId),
            queryFn: () => apiClient.getTaskDetails(taskId),
            enabled: !!taskId,
        });
    }
    function useCreateTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createTask(data),
            onSuccess: (task) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.tasks(task.projectId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.tasks() });
            },
        });
    }
    function useUpdateTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ taskId, data }) => apiClient.updateTask(taskId, data),
            onMutate: async ({ taskId, data }) => {
                await queryClient.cancelQueries({ queryKey: query_keys_1.queryKeys.task(taskId) });
                await queryClient.cancelQueries({ queryKey: query_keys_1.queryKeys.taskDetails(taskId) });
                const previousTask = queryClient.getQueryData(query_keys_1.queryKeys.task(taskId));
                const previousTaskDetails = queryClient.getQueryData(query_keys_1.queryKeys.taskDetails(taskId));
                if (previousTask) {
                    queryClient.setQueryData(query_keys_1.queryKeys.task(taskId), (old) => ({
                        ...old,
                        ...data,
                    }));
                }
                if (previousTaskDetails) {
                    queryClient.setQueryData(query_keys_1.queryKeys.taskDetails(taskId), (old) => ({
                        ...old,
                        ...data,
                    }));
                }
                return { previousTask, previousTaskDetails };
            },
            onError: (_err, { taskId }, context) => {
                if (context?.previousTask) {
                    queryClient.setQueryData(query_keys_1.queryKeys.task(taskId), context.previousTask);
                }
                if (context?.previousTaskDetails) {
                    queryClient.setQueryData(query_keys_1.queryKeys.taskDetails(taskId), context.previousTaskDetails);
                }
            },
            onSettled: (_task, _error, { taskId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.task(taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(taskId) });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['time-blocks'] });
            },
        });
    }
    function useCompleteTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (taskId) => apiClient.completeTask(taskId),
            onMutate: async (taskId) => {
                await queryClient.cancelQueries({ queryKey: query_keys_1.queryKeys.task(taskId) });
                await queryClient.cancelQueries({ queryKey: query_keys_1.queryKeys.taskDetails(taskId) });
                const previousTask = queryClient.getQueryData(query_keys_1.queryKeys.task(taskId));
                const previousTaskDetails = queryClient.getQueryData(query_keys_1.queryKeys.taskDetails(taskId));
                if (previousTask) {
                    queryClient.setQueryData(query_keys_1.queryKeys.task(taskId), (old) => ({
                        ...old,
                        status: 'COMPLETED',
                    }));
                }
                if (previousTaskDetails) {
                    queryClient.setQueryData(query_keys_1.queryKeys.taskDetails(taskId), (old) => ({
                        ...old,
                        status: 'COMPLETED',
                    }));
                }
                return { previousTask, previousTaskDetails };
            },
            onError: (_err, taskId, context) => {
                if (context?.previousTask) {
                    queryClient.setQueryData(query_keys_1.queryKeys.task(taskId), context.previousTask);
                }
                if (context?.previousTaskDetails) {
                    queryClient.setQueryData(query_keys_1.queryKeys.taskDetails(taskId), context.previousTaskDetails);
                }
            },
            onSettled: (_task, _error, taskId) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.task(taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(taskId) });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['analytics'] });
                queryClient.invalidateQueries({ queryKey: ['dailyMetrics'] });
                queryClient.invalidateQueries({ queryKey: ['timer', 'stats'] });
            },
        });
    }
    function useDeleteTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (taskId) => apiClient.deleteTask(taskId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            },
        });
    }
    function useCreateSubtask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ parentTaskId, data }) => apiClient.createSubtask(parentTaskId, data),
            onSuccess: (_, { parentTaskId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(parentTaskId) });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            },
        });
    }
    function useShareTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (taskId) => {
                if (!apiClient.generatePublicToken) {
                    throw new Error('generatePublicToken not implemented in API client');
                }
                return apiClient.generatePublicToken(taskId);
            },
            onSuccess: (_data, taskId) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(taskId) });
            },
        });
    }
    function usePublicTask(token) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.publicTask(token),
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
    function useTags(workspaceId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.tags(workspaceId),
            queryFn: () => apiClient.getTags(workspaceId),
            enabled: !!workspaceId,
        });
    }
    function useTaskTags(taskId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskTags(taskId),
            queryFn: () => apiClient.getTaskTags(taskId),
            enabled: !!taskId,
        });
    }
    function useCreateTag() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createTag(data),
            onSuccess: (tag) => {
                if (tag.workspaceId) {
                    queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.tags(tag.workspaceId) });
                }
                queryClient.invalidateQueries({ queryKey: ['tags'] });
            },
        });
    }
    function useUpdateTag() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: async ({ tagId, data }) => {
                if (!apiClient.updateTag) {
                    throw new Error('updateTag not implemented in API client');
                }
                return apiClient.updateTag(tagId, data);
            },
            onSuccess: (tag) => {
                if (tag.workspaceId) {
                    queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.tags(tag.workspaceId) });
                }
                queryClient.invalidateQueries({ queryKey: ['tags'] });
            },
        });
    }
    function useAssignTagToTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ tagId, taskId }) => apiClient.assignTagToTask(tagId, taskId),
            onSuccess: (_, { taskId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskTags(taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.task(taskId) });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['tags'] });
            },
        });
    }
    function useRemoveTagFromTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ tagId, taskId }) => apiClient.removeTagFromTask(tagId, taskId),
            onSuccess: (_, { taskId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskTags(taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.task(taskId) });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['tags'] });
            },
        });
    }
    function useDeleteTag() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (tagId) => apiClient.deleteTag(tagId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tags'] });
            },
        });
    }
    // ============ TIMER HOOKS ============
    function useActiveTimer() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.activeTimer,
            queryFn: () => apiClient.getActiveTimer(),
            refetchInterval: 1000,
        });
    }
    function useStartTimer() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.startTimer(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.activeTimer });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            },
        });
    }
    function useStopTimer() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.stopTimer(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.activeTimer });
                queryClient.invalidateQueries({ queryKey: ['analytics'] });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['timer', 'history'] });
                queryClient.invalidateQueries({ queryKey: ['timer', 'stats'] });
                queryClient.invalidateQueries({ queryKey: ['dailyMetrics'] });
            },
        });
    }
    function usePauseTimer() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.pauseTimer(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.activeTimer });
            },
        });
    }
    function useResumeTimer() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.resumeTimer(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.activeTimer });
            },
        });
    }
    function useSwitchTask() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.switchTask(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.activeTimer });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['analytics'] });
                queryClient.invalidateQueries({ queryKey: ['timer', 'history'] });
                queryClient.invalidateQueries({ queryKey: ['timer', 'stats'] });
            },
        });
    }
    function useSessionHistory(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.timerHistory(params),
            queryFn: () => apiClient.getSessionHistory(params),
        });
    }
    function useTimerStats(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.timerStats(params),
            queryFn: () => apiClient.getTimerStats(params),
        });
    }
    function useTaskTimeSessions(taskId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskTimeSessions(taskId),
            queryFn: () => apiClient.getTaskTimeSessions(taskId),
            enabled: !!taskId,
        });
    }
    // ============ ANALYTICS HOOKS ============
    function useDailyMetrics(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.dailyMetrics(params),
            queryFn: () => apiClient.getDailyMetrics(params),
        });
    }
    function useWeeklyMetrics(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.weeklyMetrics(params),
            queryFn: () => apiClient.getWeeklyMetrics(params),
        });
    }
    function useMonthlyMetrics(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.monthlyMetrics(params),
            queryFn: () => {
                if (!apiClient.getMonthlyMetrics) {
                    throw new Error('getMonthlyMetrics not implemented in API client');
                }
                return apiClient.getMonthlyMetrics(params);
            },
            enabled: !!apiClient.getMonthlyMetrics,
        });
    }
    function useDateRangeMetrics(startDate, endDate) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.dateRangeMetrics(startDate, endDate),
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
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.dashboardStats,
            queryFn: () => apiClient.getDashboardStats(),
        });
    }
    function useHeatmapData() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.heatmapData,
            queryFn: () => apiClient.getHeatmapData(),
        });
    }
    function useProjectDistribution() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.projectDistribution,
            queryFn: () => apiClient.getProjectDistribution(),
        });
    }
    function useTaskStatusDistribution() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskStatusDistribution,
            queryFn: () => apiClient.getTaskStatusDistribution(),
        });
    }
    // ============ AI HOOKS ============
    function useAIProfile() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.aiProfile,
            queryFn: () => apiClient.getAIProfile(),
        });
    }
    function useOptimalSchedule(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.optimalSchedule(params),
            queryFn: () => apiClient.getOptimalSchedule(params?.topN),
        });
    }
    function useTaskDurationPrediction(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskDurationPrediction(params),
            queryFn: () => apiClient.predictTaskDuration(params),
            enabled: !!params?.title || !!params?.description,
        });
    }
    function useGenerateWeeklyReport() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (weekStart) => apiClient.generateWeeklyReport(weekStart),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.reports() });
            },
        });
    }
    function useReports(params) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.reports(params),
            queryFn: () => apiClient.getReports(params),
        });
    }
    function useReport(id) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.report(id),
            queryFn: () => apiClient.getReport(id),
            enabled: !!id,
        });
    }
    function useDeleteReport() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (id) => apiClient.deleteReport(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.reports() });
            },
        });
    }
    // ============ COMMENT HOOKS ============
    function useTaskComments(taskId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskComments(taskId),
            queryFn: () => apiClient.getTaskComments(taskId),
            enabled: !!taskId,
        });
    }
    function useCreateComment() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createComment(data),
            onSuccess: (comment) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskComments(comment.taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(comment.taskId) });
            },
        });
    }
    function useUpdateComment() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ commentId, data }) => apiClient.updateComment(commentId, data),
            onSuccess: (comment) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskComments(comment.taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(comment.taskId) });
            },
        });
    }
    function useDeleteComment() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (commentId) => apiClient.deleteComment(commentId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            },
        });
    }
    // ============ ATTACHMENT HOOKS ============
    function useTaskAttachments(taskId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskAttachments(taskId),
            queryFn: () => apiClient.getTaskAttachments(taskId),
            enabled: !!taskId,
        });
    }
    function useCreateAttachment() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createAttachment(data),
            onSuccess: (attachment) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskAttachments(attachment.taskId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskDetails(attachment.taskId) });
            },
        });
    }
    function useDeleteAttachment() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (attachmentId) => apiClient.deleteAttachment(attachmentId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['projects'] });
            },
        });
    }
    function useProjectAttachments(projectId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.projectAttachments(projectId),
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
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.notifications,
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
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.unreadNotificationsCount,
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
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (id) => {
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
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
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
    function invalidateAllTasks(queryClient) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
    function useTimeBlocks(start, end) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.timeBlocks(start instanceof Date ? start.toISOString() : start, end instanceof Date ? end.toISOString() : end),
            queryFn: () => {
                if (!apiClient.getTimeBlocks) {
                    throw new Error('getTimeBlocks not implemented in API client');
                }
                return apiClient.getTimeBlocks(start, end);
            },
            enabled: !!apiClient.getTimeBlocks,
        });
    }
    // ============ HABIT HOOKS ============
    function useHabits(includeArchived) {
        return (0, react_query_1.useQuery)({
            queryKey: [...query_keys_1.queryKeys.habits, { includeArchived }],
            queryFn: () => apiClient.getHabits(includeArchived),
        });
    }
    function useTodayHabits() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.todayHabits,
            queryFn: () => apiClient.getTodayHabits(),
        });
    }
    function useHabit(habitId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.habit(habitId),
            queryFn: () => apiClient.getHabit(habitId),
            enabled: !!habitId,
        });
    }
    function useHabitStats(habitId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.habitStats(habitId),
            queryFn: () => apiClient.getHabitStats(habitId),
            enabled: !!habitId,
        });
    }
    function useCreateHabit() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createHabit(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habits });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.todayHabits });
            },
        });
    }
    function useUpdateHabit() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ habitId, data }) => apiClient.updateHabit(habitId, data),
            onSuccess: (_, { habitId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habit(habitId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habits });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.todayHabits });
            },
        });
    }
    function useDeleteHabit() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (habitId) => apiClient.deleteHabit(habitId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habits });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.todayHabits });
            },
        });
    }
    function useCompleteHabit() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ habitId, data }) => apiClient.completeHabit(habitId, data),
            onSuccess: (_, { habitId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habit(habitId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habitStats(habitId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habits });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.todayHabits });
                // Invalidate user profile for XP updates
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.currentUser });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.userProfile });
            },
        });
    }
    function useUncompleteHabit() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (habitId) => apiClient.uncompleteHabit(habitId),
            onSuccess: (_, habitId) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habit(habitId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habitStats(habitId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habits });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.todayHabits });
            },
        });
    }
    function usePauseHabit() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (habitId) => apiClient.pauseHabit(habitId),
            onSuccess: (_, habitId) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habit(habitId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habits });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.todayHabits });
            },
        });
    }
    function useResumeHabit() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (habitId) => apiClient.resumeHabit(habitId),
            onSuccess: (_, habitId) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habit(habitId) });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.habits });
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.todayHabits });
            },
        });
    }
    // ============ OBJECTIVES (OKRs) HOOKS ============
    function useObjectives(options) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.objectives(options),
            queryFn: () => apiClient.getObjectives(options),
        });
    }
    function useCurrentPeriodObjectives() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.currentPeriodObjectives,
            queryFn: () => apiClient.getCurrentPeriodObjectives(),
        });
    }
    function useObjectivesDashboard() {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.objectivesDashboard,
            queryFn: () => apiClient.getObjectivesDashboardSummary(),
        });
    }
    function useObjective(objectiveId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.objective(objectiveId),
            queryFn: () => apiClient.getObjective(objectiveId),
            enabled: !!objectiveId,
        });
    }
    function useCreateObjective() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (data) => apiClient.createObjective(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    function useUpdateObjective() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ objectiveId, data }) => apiClient.updateObjective(objectiveId, data),
            onSuccess: (_, { objectiveId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.objective(objectiveId) });
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    function useDeleteObjective() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (objectiveId) => apiClient.deleteObjective(objectiveId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    function useAddKeyResult() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ objectiveId, data }) => apiClient.addKeyResult(objectiveId, data),
            onSuccess: (_, { objectiveId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.objective(objectiveId) });
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    function useUpdateKeyResult() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ keyResultId, data }) => apiClient.updateKeyResult(keyResultId, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    function useDeleteKeyResult() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: (keyResultId) => apiClient.deleteKeyResult(keyResultId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    function useLinkTaskToKeyResult() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ keyResultId, data }) => apiClient.linkTaskToKeyResult(keyResultId, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    function useUnlinkTaskFromKeyResult() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ keyResultId, taskId }) => apiClient.unlinkTaskFromKeyResult(keyResultId, taskId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['objectives'] });
            },
        });
    }
    // ==================== Custom Fields ====================
    function useCustomFields(projectId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.customFields(projectId),
            queryFn: () => apiClient.getProjectCustomFields(projectId),
            enabled: !!projectId,
        });
    }
    function useCreateCustomField() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ projectId, data }) => apiClient.createCustomField(projectId, data),
            onSuccess: (_, { projectId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.customFields(projectId) });
            },
        });
    }
    function useUpdateCustomField() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ fieldId, data, projectId }) => apiClient.updateCustomField(fieldId, data),
            onSuccess: (_, { projectId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.customFields(projectId) });
            },
        });
    }
    function useDeleteCustomField() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ fieldId, projectId }) => apiClient.deleteCustomField(fieldId),
            onSuccess: (_, { projectId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.customFields(projectId) });
            },
        });
    }
    function useTaskCustomValues(taskId) {
        return (0, react_query_1.useQuery)({
            queryKey: query_keys_1.queryKeys.taskCustomValues(taskId),
            queryFn: () => apiClient.getTaskCustomValues(taskId),
            enabled: !!taskId,
        });
    }
    function useSetTaskCustomValues() {
        const queryClient = (0, react_query_1.useQueryClient)();
        return (0, react_query_1.useMutation)({
            mutationFn: ({ taskId, data }) => apiClient.setTaskCustomValues(taskId, data),
            onSuccess: (_, { taskId }) => {
                queryClient.invalidateQueries({ queryKey: query_keys_1.queryKeys.taskCustomValues(taskId) });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            },
        });
    }
    // ============ NOTES HOOKS ============
    const { useNotes, useNote, useCreateNote, useUpdateNote, useDeleteNote } = (0, use_notes_1.createNotesHooks)(apiClient);
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
