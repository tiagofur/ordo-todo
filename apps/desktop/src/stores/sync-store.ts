/**
 * Sync Store - Manages sync state in the renderer process
 * 
 * Provides reactive sync status for UI components
 */

import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: number | null;
  pendingChanges: number;
  failedChanges: number;
  isOnline: boolean;
  currentOperation?: string;
  error?: string;
}

export interface SyncQueueStats {
  pending: number;
  failed: number;
  total: number;
}

interface SyncStore extends SyncState {
  // Actions
  setSyncState: (state: Partial<SyncState>) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  
  // Electron API actions
  initialize: () => Promise<void>;
  forceSync: () => Promise<void>;
  setAuthToken: (token: string | null) => Promise<void>;
  startAutoSync: (intervalMs?: number) => Promise<void>;
  stopAutoSync: () => Promise<void>;
  refreshState: () => Promise<void>;
}

const isElectron = typeof window !== 'undefined' && window.electronAPI;

export const useSyncStore = create<SyncStore>((set, get) => ({
  // Initial state
  status: 'idle',
  lastSyncTime: null,
  pendingChanges: 0,
  failedChanges: 0,
  isOnline: true,
  currentOperation: undefined,
  error: undefined,

  // Actions
  setSyncState: (state) => set((prev) => ({ ...prev, ...state })),
  
  setOnlineStatus: (isOnline) => {
    set({ isOnline, status: isOnline ? 'idle' : 'offline' });
    if (isElectron) {
      window.electronAPI.sync.setOnlineStatus(isOnline);
    }
  },

  initialize: async () => {
    if (!isElectron) return;

    // Listen for sync state changes from main process
    window.electronAPI.sync.onStateChanged((state) => {
      set(state);
    });

    // Get initial state
    const state = await window.electronAPI.sync.getState();
    set(state);

    // Listen for online/offline events
    window.addEventListener('online', () => get().setOnlineStatus(true));
    window.addEventListener('offline', () => get().setOnlineStatus(false));

    // Set initial online status
    get().setOnlineStatus(navigator.onLine);
  },

  forceSync: async () => {
    if (!isElectron) return;
    
    set({ status: 'syncing' });
    try {
      const state = await window.electronAPI.sync.force();
      set(state);
    } catch (error) {
      set({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Sync failed' 
      });
    }
  },

  setAuthToken: async (token) => {
    if (!isElectron) return;
    await window.electronAPI.sync.setAuthToken(token);
  },

  startAutoSync: async (intervalMs = 30000) => {
    if (!isElectron) return;
    await window.electronAPI.sync.startAuto(intervalMs);
  },

  stopAutoSync: async () => {
    if (!isElectron) return;
    await window.electronAPI.sync.stopAuto();
  },

  refreshState: async () => {
    if (!isElectron) return;
    const state = await window.electronAPI.sync.getState();
    set(state);
  },
}));

/**
 * Hook to get formatted last sync time
 */
export function useLastSyncFormatted(): string {
  const lastSyncTime = useSyncStore((s) => s.lastSyncTime);
  
  if (!lastSyncTime) return 'Never synced';
  
  const now = Date.now();
  const diff = now - lastSyncTime;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(lastSyncTime).toLocaleDateString();
}
