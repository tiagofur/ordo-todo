import type { WorkspaceStore } from './types.js';
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
export declare const useWorkspaceStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<WorkspaceStore>, "setState" | "persist"> & {
    setState(partial: WorkspaceStore | Partial<WorkspaceStore> | ((state: WorkspaceStore) => WorkspaceStore | Partial<WorkspaceStore>), replace?: false | undefined): unknown;
    setState(state: WorkspaceStore | ((state: WorkspaceStore) => WorkspaceStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<WorkspaceStore, WorkspaceStore, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: WorkspaceStore) => void) => () => void;
        onFinishHydration: (fn: (state: WorkspaceStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<WorkspaceStore, WorkspaceStore, unknown>>;
    };
}>;
/**
 * Get the current selected workspace ID without subscribing to changes.
 * Useful for one-time reads in non-React code.
 */
export declare const getSelectedWorkspaceId: () => string | null;
/**
 * Set the selected workspace ID without using the hook.
 * Useful for imperative updates in non-React code.
 */
export declare const setSelectedWorkspaceId: (id: string | null) => void;
//# sourceMappingURL=workspace-store.d.ts.map