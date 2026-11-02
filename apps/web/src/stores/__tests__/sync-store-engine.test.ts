import { describe, it, expect, vi, beforeEach } from 'vitest';

// The store delegates queue persistence and the sync loop to the portable
// engine, so IndexedDB here is a mock: we assert the engine drives the
// adapter (save/remove/retry) and the store keeps its UI contract
// (counts, progress, status, events, last-sync time).
vi.mock("@/lib/offline-storage", () => ({
  getPendingActionsCount: vi.fn(async () => 0),
  getLastSyncTime: vi.fn(async () => 1700000000000),
  setLastSyncTime: vi.fn(async () => undefined),
  getAllPendingActions: vi.fn(async () => []),
  updatePendingAction: vi.fn(async () => undefined),
  removePendingAction: vi.fn(async () => undefined),
  incrementRetryCount: vi.fn(async () => null),
}));

vi.mock("@/lib/api-client", () => ({
  getCsrfToken: vi.fn(async () => "test-csrf"),
}));

vi.mock("@/config", () => ({
  config: { api: { baseURL: "http://test-api" } },
}));

import { useSyncStore } from "../sync-store";
import {
  getAllPendingActions,
  updatePendingAction,
  removePendingAction,
  incrementRetryCount,
  getPendingActionsCount,
  setLastSyncTime,
} from "@/lib/offline-storage";

const webAction = {
  id: "action_1",
  type: "CREATE_TASK",
  endpoint: "/tasks",
  method: "POST",
  payload: { title: "t" },
  entityType: "task",
  entityId: undefined,
  timestamp: 1700000000000,
  retryCount: 0,
  maxRetries: 3,
};

describe("sync-store on the portable engine", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      configurable: true,
    });
    fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(getAllPendingActions).mockResolvedValue([]);
    vi.mocked(incrementRetryCount).mockResolvedValue(null);
    useSyncStore.setState({
      isOnline: true,
      status: "idle",
      isSyncing: false,
      currentAction: null,
      syncProgress: 0,
      lastError: null,
    });
    // The monitor captures navigator.onLine at init (falsy under jsdom);
    // announce recovery so the engine's isOnline reads true.
    window.dispatchEvent(new Event("online"));
  });

  it("queues through the engine with web retry defaults and notifies UI", async () => {
    const queued: unknown[] = [];
    window.addEventListener(
      "ordo-todo:action-queued",
      (e) => queued.push((e as CustomEvent).detail),
      { once: true },
    );

    const id = await useSyncStore.getState().queueAction(
      "CREATE_TASK",
      "/tasks",
      "POST",
      { title: "t" },
      "task",
      undefined,
    );

    expect(typeof id).toBe("string");
    expect(updatePendingAction).toHaveBeenCalledTimes(1);
    expect(updatePendingAction).toHaveBeenCalledWith(
      expect.objectContaining({
        id,
        type: "CREATE_TASK",
        endpoint: "/tasks",
        method: "POST",
        payload: { title: "t" },
        entityType: "task",
        retryCount: 0,
        maxRetries: 3,
      }),
    );
    expect(getPendingActionsCount).toHaveBeenCalled();
    expect(queued).toHaveLength(1);
  });

  it("syncAll drains the queue over HTTP and reports success", async () => {
    vi.mocked(getAllPendingActions).mockResolvedValue([webAction as never]);
    const completed: unknown[] = [];
    window.addEventListener(
      "ordo-todo:sync-complete",
      (e) => completed.push((e as CustomEvent).detail),
      { once: true },
    );

    const result = await useSyncStore.getState().syncAll();

    expect(result).toMatchObject({ success: true, synced: 1, failed: 0 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api/tasks",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(removePendingAction).toHaveBeenCalledWith("action_1");
    const state = useSyncStore.getState();
    expect(state.status).toBe("idle");
    expect(state.syncProgress).toBe(100);
    expect(state.lastSyncTime).toBe(1700000000000);
    expect(setLastSyncTime).toHaveBeenCalled();
    expect(completed).toHaveLength(1);
  });

  it("syncAll marks failure once retries are exhausted", async () => {
    vi.mocked(getAllPendingActions).mockResolvedValue([
      { ...webAction, retryCount: 2 } as never,
    ]);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "boom" }),
    });
    vi.mocked(incrementRetryCount).mockResolvedValue({
      ...webAction,
      retryCount: 3,
    } as never);

    const result = await useSyncStore.getState().syncAll();

    expect(result).toMatchObject({ success: false, synced: 0, failed: 1 });
    expect(result.errors).toEqual([{ actionId: "action_1", error: "boom" }]);
    const state = useSyncStore.getState();
    expect(state.status).toBe("error");
    expect(state.lastError).toBe("1 action(s) failed to sync");
  });
});
