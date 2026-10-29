import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

// IndexedDB (jsdom lacks it) and storage side effects are out of scope here:
// we only assert how the store follows the debounced online-status monitor
vi.mock("@/lib/offline-storage", () => ({
  getAllPendingActions: vi.fn(async () => []),
  getPendingActionsCount: vi.fn(async () => 0),
  addPendingAction: vi.fn(async () => "action-id"),
  removePendingAction: vi.fn(async () => undefined),
  incrementRetryCount: vi.fn(async () => undefined),
  getLastSyncTime: vi.fn(async () => 1700000000000),
  setLastSyncTime: vi.fn(async () => undefined),
}));

import { useSyncStore } from "../sync-store";
import { getOnlineStatus } from "@/lib/online-status-monitor";

const CONFIRMATION_DELAY_MS = 5000;

function goOffline() {
  window.dispatchEvent(new Event('offline'));
}

function goOnline() {
  window.dispatchEvent(new Event('online'));
}

describe('sync-store online wiring (integration with the monitor)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom leaves navigator.onLine undefined; browsers always report a boolean
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true,
    });
    // The store subscribed to the monitor singleton at module load (no reset
    // here: resetting would drop that wiring). Normalize to online instead.
    if (!getOnlineStatus()) {
      goOnline();
    }
  });

  it('flips to offline only once the outage is confirmed', () => {
    goOffline();
    expect(useSyncStore.getState().isOnline).toBe(true);
    expect(useSyncStore.getState().status).not.toBe("offline");

    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);
    expect(useSyncStore.getState().isOnline).toBe(false);
    expect(useSyncStore.getState().status).toBe("offline");

    goOnline();
    expect(useSyncStore.getState().isOnline).toBe(true);
  });

  it('stays online and does not auto-sync on micro-flaps', async () => {
    const baseline = useSyncStore.getState().lastSyncTime;

    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS - 1000);
    goOnline();
    // Flush the (never started) auto-sync microtasks
    await act(async () => {
      await Promise.resolve();
    });

    expect(useSyncStore.getState().isOnline).toBe(true);
    expect(useSyncStore.getState().lastSyncTime).toBe(baseline);
  });

  it('auto-syncs once after a confirmed recovery', async () => {
    goOffline();
    vi.advanceTimersByTime(CONFIRMATION_DELAY_MS);

    goOnline();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const state = useSyncStore.getState();
    expect(state.isOnline).toBe(true);
    expect(state.isSyncing).toBe(false);
    expect(state.lastSyncTime).not.toBeNull();
  });
});
