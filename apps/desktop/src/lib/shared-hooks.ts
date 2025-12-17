import { createHooks } from '@ordo-todo/hooks';
import { apiClient } from './api-client';

/**
 * Shared React Query hooks initialized with the Desktop API client.
 * 
 * Only hooks that are confirmed to exist in @ordo-todo/hooks are exported here.
 * If you need a hook that is missing, please add it to @ordo-todo/hooks first.
 */
export const {
    // Auth
    useRegister,
    useLogin,
    useLogout,

    // User
    useCurrentUser,
    useUpdateProfile,
    // useUpdatePassword, 

    // Workspace
    useWorkspaces,
    // useWorkspace, 
    useCreateWorkspace,
    useUpdateWorkspace,
    useDeleteWorkspace,
    useWorkspaceMembers,
    useAddWorkspaceMember,
    useRemoveWorkspaceMember,
    useWorkspaceInvitations,
    useInviteMember,

    // Project
    useProjects,
    useAllProjects,
    useProject,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
    useArchiveProject,
    useCompleteProject,

    // Task
    useTasks,
    useTask,
    useTaskDetails,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useCompleteTask,

    // Subtask
    useCreateSubtask,
    // useUpdateSubtask,
    // useDeleteSubtask,
    // useToggleSubtask,

    // Tag
    useTags,
    useCreateTag,
    useUpdateTag,
    useDeleteTag,

    // Timer
    // useSessions,
    // useDailyMetrics,
    useStartTimer,
    useStopTimer,
    // useDeleteSession,
    // useTimeBlocks,

    // Habits
    useHabits,
    useCreateHabit,
    useUpdateHabit,
    useDeleteHabit,
    useCompleteHabit,

    // Custom Fields
    useCustomFields,
    useCreateCustomField,
    useUpdateCustomField,
    useDeleteCustomField,

    // Comments
    useTaskComments,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,

} = createHooks({ apiClient });
