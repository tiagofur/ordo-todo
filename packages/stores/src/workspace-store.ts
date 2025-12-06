import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkspaceStore } from './types';

/**
 * Shared workspace store for managing the currently selected workspace.
 *
 * This store is used across web, mobile, and desktop applications to
 * maintain consistency in which workspace the user is currently viewing.
 *
 * The store is persisted to local storage (or equivalent on other platforms)
 * so the selected workspace is remembered across sessions.
 *
 * @example
 * ```tsx
 * import { useWorkspaceStore } from '@ordo-todo/stores';
 *
 * function WorkspaceSelector() {
 *   const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
 *
 *   return (
 *     <select
 *       value={selectedWorkspaceId || ''}
 *       onChange={(e) => setSelectedWorkspaceId(e.target.value || null)}
 *     >
 *       <option value="">Select workspace</option>
 *       {workspaces.map(ws => (
 *         <option key={ws.id} value={ws.id}>{ws.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      // State
      selectedWorkspaceId: null,

      // Actions
      setSelectedWorkspaceId: (id) => set({ selectedWorkspaceId: id }),
    }),
    {
      name: 'workspace-storage',
    }
  )
);

/**
 * Get the current selected workspace ID without subscribing to changes.
 * Useful for one-time reads in non-React code.
 */
export const getSelectedWorkspaceId = (): string | null => {
  return useWorkspaceStore.getState().selectedWorkspaceId;
};

/**
 * Set the selected workspace ID without using the hook.
 * Useful for imperative updates in non-React code.
 */
export const setSelectedWorkspaceId = (id: string | null): void => {
  useWorkspaceStore.getState().setSelectedWorkspaceId(id);
};
