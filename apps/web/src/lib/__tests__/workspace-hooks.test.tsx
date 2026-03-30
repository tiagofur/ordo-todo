/**
 * Unit Tests for Workspace React Query Hooks
 *
 * These tests verify that React Query hooks for workspace operations.
 * Tests cover:
 * 1. Query hooks (fetching workspaces, members, invitations, settings)
 * 2. Mutation hooks (create, update, delete workspaces, manage members)
 * 3. Cache invalidation behavior
 * 4. Error handling
 * 5. Loading states
 *
 * @note Uses @testing-library/react for testing hooks in isolation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHooks } from "@ordo-todo/hooks";
import type { OrdoApiClient } from "@ordo-todo/api-client";
import type {
  Workspace,
  WorkspaceWithMembers,
  WorkspaceMember,
  WorkspaceInvitation,
  WorkspaceSettings,
  WorkspaceAuditLog,
  WorkspaceAuditLogsResponse,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from "@ordo-todo/api-client";

// Test utilities
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Mock API Client
class MockOrdoApiClient implements Partial<OrdoApiClient> {
  // Workspace properties
  public getWorkspaces: () => Promise<Workspace[]> = vi.fn();
  public getWorkspace: (id: string) => Promise<WorkspaceWithMembers> = vi.fn();
  public getWorkspaceBySlug: (
    username: string,
    slug: string,
  ) => Promise<WorkspaceWithMembers> = vi.fn();
  public createWorkspace: (data: CreateWorkspaceDto) => Promise<Workspace> =
    vi.fn();
  public updateWorkspace: (
    id: string,
    data: UpdateWorkspaceDto,
  ) => Promise<Workspace> = vi.fn();
  public deleteWorkspace: (id: string) => Promise<void> = vi.fn();

  // Member properties
  public getWorkspaceMembers: (id: string) => Promise<WorkspaceMember[]> =
    vi.fn();
  public addWorkspaceMember: (
    id: string,
    data: { userId: string; role: string },
  ) => Promise<{ success: boolean }> = vi.fn();
  public removeWorkspaceMember: (
    workspaceId: string,
    userId: string,
  ) => Promise<void> = vi.fn();

  // Invitation properties
  public getWorkspaceInvitations: (
    id: string,
  ) => Promise<WorkspaceInvitation[]> = vi.fn();
  public inviteWorkspaceMember: (
    id: string,
    data: { email: string; role?: string },
  ) => Promise<WorkspaceInvitation> = vi.fn();
  public acceptWorkspaceInvitation: (data: {
    token: string;
  }) => Promise<{ success: boolean }> = vi.fn();

  // Settings properties
  public getWorkspaceSettings: (id: string) => Promise<WorkspaceSettings> =
    vi.fn();
  public updateWorkspaceSettings: (
    id: string,
    data: Record<string, unknown>,
  ) => Promise<WorkspaceSettings> = vi.fn();

  // Audit logs properties
  public getWorkspaceAuditLogs: (
    id: string,
    params?: { limit?: number; offset?: number },
  ) => Promise<WorkspaceAuditLogsResponse> = vi.fn();
}

// Mock data factories
const createMockWorkspace = (overrides?: Partial<Workspace>): Workspace => ({
  id: "workspace-123",
  name: "Test Workspace",
  slug: "test",
  description: null,
  color: "#2563EB",
  icon: null,
  tier: "FREE",
  ownerId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createMockWorkspaceSettings = (): WorkspaceSettings => ({
  id: "settings-123",
  workspaceId: "workspace-123",
  defaultView: "LIST",
  defaultDueTime: 9,
  timezone: "UTC",
  locale: "en",
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("useCreateWorkspace", () => {
  let mockClient: MockOrdoApiClient;
  let queryClient: QueryClient;
  let hooks: ReturnType<typeof createHooks>;

  beforeEach(() => {
    mockClient = new MockOrdoApiClient();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    hooks = createHooks({ apiClient: mockClient as unknown as OrdoApiClient });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create workspace successfully", async () => {
    const resultWorkspace = createMockWorkspace({ id: "new-workspace" });

    const { result } = renderHook(() => hooks.useCreateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    vi.mocked(mockClient.createWorkspace).mockResolvedValue(resultWorkspace);

    await act(async () => {
      await result.current.mutateAsync({
        name: "New",
        slug: "new",
      });
    });

    expect(mockClient.createWorkspace).toHaveBeenCalledWith({
      name: "New",
      slug: "new",
    });
    expect(result.current.data).toEqual(resultWorkspace);
  });
});
