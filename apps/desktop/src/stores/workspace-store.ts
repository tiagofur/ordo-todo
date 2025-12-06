/**
 * Workspace Store
 *
 * Re-exports the shared workspace store from @ordo-todo/stores.
 * This ensures consistency across all platforms while maintaining
 * the same import path for existing code.
 */

export {
  useWorkspaceStore,
  getSelectedWorkspaceId,
  setSelectedWorkspaceId,
} from '@ordo-todo/stores';

// Also export types for convenience
export type { WorkspaceStore } from '@ordo-todo/stores';
