import { create } from 'zustand';
import { getOnlineStatus, subscribeOnlineStatus } from '@ordo-todo/online-status';

// The debounced monitor keeps the sync indicator aligned with the confirmed
// connectivity: micro network flaps never flip the online state
function followOnlineStatus(
  setOnlineStatus: (isOnline: boolean) => void,
): void {
  subscribeOnlineStatus(setOnlineStatus);
  setOnlineStatus(getOnlineStatus());
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'offline' | 'error';
  lastSyncTime: number | null;
  pendingChanges: number;
  failedChanges: number;
  isOnline: boolean;
  currentOperation?: string;
  error?: string;
}

export interface SyncStore extends SyncState {
  setSyncState: (state: Partial<SyncState>) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  initialize: () => Promise<void>;
  forceSync: () => Promise<void>;
  setAuthToken: (token: string | null) => Promise<void>;
  startAutoSync: (intervalMs?: number) => Promise<void>;
  stopAutoSync: () => Promise<void>;
  refreshState: () => Promise<void>;
}

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
    const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (electronAPI?.sync) {
      electronAPI.sync.setOnlineStatus(isOnline);
    }
  },

  initialize: async () => {
    const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!electronAPI?.sync) {
      followOnlineStatus((online) => get().setOnlineStatus(online));
      return;
    }

    electronAPI.sync.onStateChanged((state: any) => {
      set(state);
    });

    const state = await electronAPI.sync.getState();
    set(state);

    followOnlineStatus((online) => get().setOnlineStatus(online));
  },

  forceSync: async () => {
    const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!electronAPI?.sync) return;

    set({ status: 'syncing' });
    try {
      const state = await electronAPI.sync.force();
      set(state);
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Sync failed',
      });
    }
  },

  setAuthToken: async (token) => {
    const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!electronAPI?.sync) return;
    await electronAPI.sync.setAuthToken(token);
  },

  startAutoSync: async (intervalMs = 30000) => {
    const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!electronAPI?.sync) return;
    await electronAPI.sync.startAuto(intervalMs);
  },

  stopAutoSync: async () => {
    const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!electronAPI?.sync) return;
    await electronAPI.sync.stopAuto();
  },

  refreshState: async () => {
    const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (!electronAPI?.sync) return;
    const state = await electronAPI.sync.getState();
    set(state);
  },
}));

export const useSyncState = () => useSyncStore();

export const useLastSyncFormatted = () => {
  const lastSyncTime = useSyncStore((s) => s.lastSyncTime);
  if (!lastSyncTime) return 'Nunca';

  const diff = Date.now() - lastSyncTime;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Justo ahora';
  if (minutes === 1) return 'Hace 1 minuto';
  if (minutes < 60) return `Hace ${minutes} minutos`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'Hace 1 hora';
  if (hours < 24) return `Hace ${hours} horas`;

  return new Date(lastSyncTime).toLocaleDateString();
};
