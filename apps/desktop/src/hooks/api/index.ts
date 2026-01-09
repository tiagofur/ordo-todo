/**
 * API Hooks Index
 *
 * Re-exports shared hooks from @ordo-todo/hooks via shared-hooks.ts
 * and desktop-specific hooks that extend or customize shared functionality.
 */

// Re-export all shared hooks as the base
export * from '@/lib/shared-hooks';

// ============ DESKTOP-SPECIFIC HOOKS ============

// Tasks (desktop-specific additions)
export {
    useAvailableTasks,
    useTaskDependencies,
    useAddDependency,
    useRemoveDependency,
    useSharedTask,
    useShareUrl,
    useGenerateShareToken,
    useTimeBlocks as useLocalTimeBlocks,
} from './use-tasks';

// Custom Fields (desktop-specific form utilities)
// Import manually to avoid re-exporting names that don't exist
export {
    useCustomFieldForm,
    useLocalTaskCustomValues,
    useLocalSetTaskCustomValues,
} from './use-custom-fields';

// Dashboard Extras
export * from './use-dashboard-extras';

// Templates
export {
    useTemplates,
    useTemplate,
    useCreateTemplate,
    useUpdateTemplate,
    useDeleteTemplate,
    type TaskTemplate,
    type CreateTemplateDto,
    type UpdateTemplateDto,
} from './use-templates';

// Workspaces
export {
    useDesktopWorkspaceBySlug,
    useLegacyWorkspaceBySlug
} from './use-workspaces';
