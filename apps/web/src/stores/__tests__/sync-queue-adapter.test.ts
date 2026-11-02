import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWebSyncQueueAdapter } from "../sync-queue-adapter";
import {
  getAllPendingActions,
  updatePendingAction,
  removePendingAction,
  incrementRetryCount,
} from "@/lib/offline-storage";

vi.mock("@/lib/offline-storage", () => ({
  getAllPendingActions: vi.fn(),
  updatePendingAction: vi.fn(),
  removePendingAction: vi.fn(),
  incrementRetryCount: vi.fn(),
}));

const webAction = {
  id: "action_1",
  type: "CREATE_TASK",
  endpoint: "/tasks",
  method: "POST",
  payload: { title: "t" },
  entityType: "task",
  timestamp: 1700000000000,
  retryCount: 0,
  maxRetries: 3,
} as const;

describe("createWebSyncQueueAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads web actions mapped to the package contract", async () => {
    vi.mocked(getAllPendingActions).mockResolvedValue([webAction as never]);
    const adapter = createWebSyncQueueAdapter();
    const [loaded] = await adapter.load();
    expect(loaded).toMatchObject({
      id: "action_1",
      type: "CREATE_TASK",
      url: "/tasks",
      method: "POST",
      data: { title: "t" },
      entityType: "task",
      createdAt: 1700000000000,
      retryCount: 0,
    });
  });

  it("saves package actions mapped back to the web shape", async () => {
    const adapter = createWebSyncQueueAdapter();
    await adapter.save({
      id: "a2",
      type: "DELETE_TASK",
      url: "/tasks/t1",
      method: "DELETE",
      data: {},
      entityType: "task",
      createdAt: 1700000000001,
      retryCount: 0,
    });
    expect(updatePendingAction).toHaveBeenCalledWith({
      id: "a2",
      type: "DELETE_TASK",
      endpoint: "/tasks/t1",
      method: "DELETE",
      payload: {},
      entityType: "task",
      timestamp: 1700000000001,
      retryCount: 0,
      maxRetries: 3,
    });
  });

  it("removes and records retries with the error text", async () => {
    const adapter = createWebSyncQueueAdapter();
    await adapter.remove("a3");
    expect(removePendingAction).toHaveBeenCalledWith("a3");
    await adapter.updateRetry("a3", 2, "down");
    expect(incrementRetryCount).toHaveBeenCalledWith("a3", "down");
  });
});
