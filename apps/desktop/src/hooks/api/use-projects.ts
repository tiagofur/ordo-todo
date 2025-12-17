/**
 * Project Management Hooks
 * 
 * Now using shared hooks from @ordo-todo/hooks via shared-hooks.ts
 */

export {
  useProjects,
  useAllProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  // useArchiveProject, // Uncomment if supported in shared hooks
  // useCompleteProject, // Uncomment if available
} from '@/lib/shared-hooks';

