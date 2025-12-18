import type { UIStore, UIStoreState } from './types.js';
/**
 * Default UI state values
 */
export declare const defaultUIState: UIStoreState;
/**
 * Shared UI store for managing UI state across platforms.
 *
 * Handles sidebar, dialogs, panels, view preferences, and sort/filter settings.
 *
 * @example
 * ```tsx
 * import { useUIStore } from '@ordo-todo/stores';
 *
 * function Sidebar() {
 *   const { sidebarCollapsed, toggleSidebar } = useUIStore();
 *
 *   return (
 *     <aside className={sidebarCollapsed ? 'collapsed' : ''}>
 *       <button onClick={toggleSidebar}>Toggle</button>
 *     </aside>
 *   );
 * }
 * ```
 */
export declare const useUIStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<UIStore>, "setState" | "persist"> & {
    setState(partial: UIStore | Partial<UIStore> | ((state: UIStore) => UIStore | Partial<UIStore>), replace?: false | undefined): unknown;
    setState(state: UIStore | ((state: UIStore) => UIStore), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<UIStore, {
            sidebarCollapsed: boolean;
            sidebarWidth: number;
            tasksViewMode: "list" | "grid";
            projectsViewMode: "list" | "grid" | "kanban";
            dashboardLayout: "compact" | "expanded";
            tasksSortBy: "priority" | "dueDate" | "createdAt" | "title";
            tasksSortOrder: "asc" | "desc";
            showCompletedTasks: boolean;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: UIStore) => void) => () => void;
        onFinishHydration: (fn: (state: UIStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<UIStore, {
            sidebarCollapsed: boolean;
            sidebarWidth: number;
            tasksViewMode: "list" | "grid";
            projectsViewMode: "list" | "grid" | "kanban";
            dashboardLayout: "compact" | "expanded";
            tasksSortBy: "priority" | "dueDate" | "createdAt" | "title";
            tasksSortOrder: "asc" | "desc";
            showCompletedTasks: boolean;
        }, unknown>>;
    };
}>;
//# sourceMappingURL=ui-store.d.ts.map