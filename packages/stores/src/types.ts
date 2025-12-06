/**
 * Shared store types for Ordo-Todo applications
 */

/**
 * Workspace store state and actions
 */
export interface WorkspaceStoreState {
  selectedWorkspaceId: string | null;
}

export interface WorkspaceStoreActions {
  setSelectedWorkspaceId: (id: string | null) => void;
}

export type WorkspaceStore = WorkspaceStoreState & WorkspaceStoreActions;

/**
 * UI store state and actions
 */
export interface UIStoreState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  commandPaletteOpen: boolean;
}

export interface UIStoreActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export type UIStore = UIStoreState & UIStoreActions;

/**
 * Sync status for offline-first functionality
 */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface PendingAction {
  id: string;
  type: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data: Record<string, unknown>;
  entityType: 'task' | 'project' | 'comment' | 'timer';
  entityId?: string;
  createdAt: number;
  retryCount: number;
}

export interface SyncStoreState {
  status: SyncStatus;
  pendingActions: PendingAction[];
  lastSyncAt: number | null;
  error: string | null;
}

export interface SyncStoreActions {
  setStatus: (status: SyncStatus) => void;
  queueAction: (
    type: string,
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data: Record<string, unknown>,
    entityType: 'task' | 'project' | 'comment' | 'timer',
    entityId?: string
  ) => Promise<string>;
  removeAction: (actionId: string) => void;
  clearPendingActions: () => void;
  setLastSyncAt: (timestamp: number) => void;
  setError: (error: string | null) => void;
}

export type SyncStore = SyncStoreState & SyncStoreActions;
