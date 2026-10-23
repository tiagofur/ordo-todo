import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminLayout from "@/app/[locale]/(pages)/admin/layout";
import { AdminUsersTable } from "../admin-users-table";
import { AdminInviteCodesTable } from "../admin-invite-codes-table";
import {
  CreateInviteCodeDialog,
  endOfDayUtcIso,
} from "../create-invite-code-dialog";
import type {
  AdminInviteCode,
  AdminUserListItem,
  AdminUsersPage,
} from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Mocks (stable references — never fresh vi.fn() per call)
// ---------------------------------------------------------------------------

const replaceMock = vi.fn();

// AppLayout drags the whole shell (sidebar, topbar, command palette); the
// admin gating under test only needs a passthrough.
vi.mock("@/components/shared/app-layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/admin",
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} onClick={(event) => event.preventDefault()}>
      {children}
    </a>
  ),
}));

// ODD 019 T6 contract: /users/me returns isAdmin for the platform admin.
const authState: { user: Record<string, unknown> | null; isLoading: boolean } =
  { user: null, isLoading: true };

vi.mock("@ordo-todo/auth-provider", () => ({
  useAuth: () => authState,
}));

const overviewFixture = {
  users: { total: 2, newLast7Days: 1, newLast30Days: 2, activeLast30Days: 2 },
  tasks: { total: 10, completed: 4 },
  workspaces: { total: 3 },
  planDistribution: { FREE: 1, PRO: 1 },
  generatedAt: new Date("2026-10-23T10:00:00Z").toISOString(),
};

const usersState: { data: AdminUsersPage | undefined; isLoading: boolean } = {
  data: undefined,
  isLoading: false,
};

const useAdminUsersMock = vi.fn();

const blockMutate = vi.fn().mockResolvedValue({ id: "user-1", status: "BLOCKED" });
const unblockMutate = vi.fn().mockResolvedValue({ id: "user-1", status: "ACTIVE" });
const grantProMutate = vi
  .fn()
  .mockResolvedValue({ id: "user-1", plan: "PRO", expiresAt: null });
const revokeProMutate = vi
  .fn()
  .mockResolvedValue({ id: "user-1", plan: "FREE" });
const createCodeMutate = vi.fn().mockResolvedValue({
  id: "code-1",
  code: "ORDO-TEST-CODE",
  label: null,
  maxUses: 1,
  usedCount: 0,
  expiresAt: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  redemptions: 0,
});
const deactivateMutate = vi.fn().mockResolvedValue({ id: "code-1" });

vi.mock("@/hooks/use-admin", () => ({
  useAdminOverview: () => ({ data: overviewFixture, isLoading: false }),
  useAdminUsers: (...args: unknown[]) => useAdminUsersMock(...args),
  useAdminUser: () => ({ data: undefined, isLoading: false }),
  useBlockUser: () => ({ mutateAsync: blockMutate, isPending: false }),
  useUnblockUser: () => ({ mutateAsync: unblockMutate, isPending: false }),
  useGrantPro: () => ({ mutateAsync: grantProMutate, isPending: false }),
  useRevokePro: () => ({ mutateAsync: revokeProMutate, isPending: false }),
  useInviteCodes: () => ({ data: codesState.data, isLoading: false }),
  useCreateInviteCode: () => ({
    mutateAsync: createCodeMutate,
    isPending: false,
  }),
  useDeactivateInviteCode: () => ({
    mutateAsync: deactivateMutate,
    isPending: false,
  }),
}));

const usersFixture: AdminUserListItem[] = [
  {
    id: "user-1",
    email: "pro@example.com",
    username: "pro",
    name: "Pro User",
    status: "ACTIVE",
    blockedAt: null,
    lastLoginAt: "2026-10-20T10:00:00.000Z",
    createdAt: "2026-09-01T10:00:00.000Z",
    plan: "PRO",
  },
  {
    id: "user-2",
    email: "blocked@example.com",
    username: "blocked",
    name: "Blocked User",
    status: "BLOCKED",
    blockedAt: "2026-10-21T10:00:00.000Z",
    lastLoginAt: null,
    createdAt: "2026-09-15T10:00:00.000Z",
    plan: "FREE",
  },
];

const codesState: { data: AdminInviteCode[] | undefined } = { data: undefined };

const confirmMock = vi.fn(async () => true);

vi.mock("@/components/shared/confirm-dialog", () => ({
  useConfirm: () => ({ confirm: confirmMock, ConfirmModal: () => null }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/error-handler", () => ({
  getErrorMessage: vi.fn((_e: unknown, fallback: string) => fallback),
}));

vi.mock("../admin-user-detail-dialog", () => ({
  AdminUserDetailDialog: () => null,
}));

// Radix dropdowns/selects need these in jsdom
beforeEach(() => {
  replaceMock.mockClear();
  useAdminUsersMock.mockReset();
  useAdminUsersMock.mockImplementation(() => ({
    data: usersState.data,
    isLoading: usersState.isLoading,
  }));
  usersState.data = { total: 2, page: 1, limit: 10, users: usersFixture };
  usersState.isLoading = false;
  codesState.data = [
    {
      id: "code-1",
      code: "ORDO-AAAA-BBBB",
      label: "Beta friend",
      maxUses: 5,
      usedCount: 1,
      expiresAt: null,
      isActive: true,
      createdAt: "2026-10-01T10:00:00.000Z",
      redemptions: 1,
    },
  ];
  authState.user = { id: "admin-1", isAdmin: true };
  authState.isLoading = false;
  confirmMock.mockClear();
  blockMutate.mockClear();
  unblockMutate.mockClear();
  grantProMutate.mockClear();
  revokeProMutate.mockClear();
  createCodeMutate.mockClear();
  deactivateMutate.mockClear();
  (navigator.clipboard.writeText as unknown as { mockClear: () => void }).mockClear();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

// ---------------------------------------------------------------------------
// 1. Gating: admin/layout
// ---------------------------------------------------------------------------

describe("AdminLayout gating (ODD 019 T6)", () => {
  it("redirects to /dashboard and renders nothing for a non-admin", () => {
    authState.user = { id: "user-1", isAdmin: false };
    authState.isLoading = false;

    render(
      <AdminLayout>
        <div data-testid="admin-children">panel</div>
      </AdminLayout>
    );

    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByTestId("admin-children")).toBeNull();
  });

  it("renders children for the platform admin without redirecting", () => {
    render(
      <AdminLayout>
        <div data-testid="admin-children">panel</div>
      </AdminLayout>
    );

    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("admin-children")).toBeInTheDocument();
  });

  it("shows a loading skeleton and does not redirect while auth resolves", () => {
    authState.user = null;
    authState.isLoading = true;

    render(
      <AdminLayout>
        <div data-testid="admin-children">panel</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("admin-layout-loading")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 2. Users table: rows, badges and the actions menu
// ---------------------------------------------------------------------------

describe("AdminUsersTable (ODD 019 T6)", () => {
  it("requests the first page and renders rows with plan and status badges", () => {
    render(<AdminUsersTable />);

    expect(useAdminUsersMock).toHaveBeenCalledWith({
      search: "",
      page: 1,
      limit: 10,
    });
    expect(screen.getByText("pro@example.com")).toBeInTheDocument();
    expect(screen.getByText("blocked@example.com")).toBeInTheDocument();
    expect(screen.getByText("plan.pro")).toBeInTheDocument();
    expect(screen.getByText("plan.free")).toBeInTheDocument();
    expect(screen.getByText("statusActive")).toBeInTheDocument();
    expect(screen.getByText("statusBlocked")).toBeInTheDocument();
  });

  it("blocks a user from the row actions menu after confirmation", async () => {
    render(<AdminUsersTable />);

    const row = screen.getByText("pro@example.com").closest("tr")!;
    const trigger = row.querySelector("button")!;
    // Radix menus open on the pointerdown → pointerup → click sequence in jsdom
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);

    fireEvent.click(await screen.findByText("block"));

    await waitFor(() => {
      expect(blockMutate).toHaveBeenCalledWith("user-1");
    });
    expect(confirmMock).toHaveBeenCalled();
  });

  it("unblocks a blocked user from the row actions menu", async () => {
    render(<AdminUsersTable />);

    const row = screen.getByText("blocked@example.com").closest("tr")!;
    fireEvent.pointerDown(row.querySelector("button")!);
    fireEvent.pointerUp(row.querySelector("button")!);
    fireEvent.click(row.querySelector("button")!);

    fireEvent.click(await screen.findByText("unblock"));

    await waitFor(() => {
      expect(unblockMutate).toHaveBeenCalledWith("user-2");
    });
  });

  it("gifts Pro from the actions menu with the selected duration", async () => {
    render(<AdminUsersTable />);

    const row = screen.getByText("pro@example.com").closest("tr")!;
    fireEvent.pointerDown(row.querySelector("button")!);
    fireEvent.pointerUp(row.querySelector("button")!);
    fireEvent.click(row.querySelector("button")!);

    fireEvent.click(await screen.findByText("grantPro"));
    fireEvent.click(await screen.findByText("confirm"));

    await waitFor(() => {
      expect(grantProMutate).toHaveBeenCalledWith({
        userId: "user-1",
        data: { days: 30 },
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Invite codes: creation payload and clipboard copy
// ---------------------------------------------------------------------------

describe("Invite codes (ODD 019 T6)", () => {
  it("creates a code with label, maxUses and an end-of-day UTC expiresAt", async () => {
    render(<CreateInviteCodeDialog open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText("label"), {
      target: { value: "Beta friend" },
    });
    fireEvent.change(screen.getByLabelText("maxUses"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("expiresAt"), {
      target: { value: "2027-01-15" },
    });
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(createCodeMutate).toHaveBeenCalledWith({
        label: "Beta friend",
        maxUses: 5,
        expiresAt: new Date("2027-01-15T23:59:59.999Z").toISOString(),
      });
    });
  });

  it("rejects a past expiration date without calling the mutation", async () => {
    render(<CreateInviteCodeDialog open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText("expiresAt"), {
      target: { value: "2020-01-01" },
    });
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() => {
      expect(screen.getByText("expiresAtInvalid")).toBeInTheDocument();
    });
    expect(createCodeMutate).not.toHaveBeenCalled();
  });

  it("copies a code to the clipboard from the codes table", async () => {
    render(<AdminInviteCodesTable />);

    expect(screen.getByText("ORDO-AAAA-BBBB")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("copy"));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "ORDO-AAAA-BBBB"
      );
    });
  });

  it("deactivates a code after confirmation", async () => {
    render(<AdminInviteCodesTable />);

    // The useConfirm mock resolves true without rendering a modal
    fireEvent.click(screen.getByLabelText("deactivate"));

    await waitFor(() => {
      expect(deactivateMutate).toHaveBeenCalledWith("code-1");
    });
    expect(confirmMock).toHaveBeenCalled();
  });
});

describe("endOfDayUtcIso helper", () => {
  it("returns the end of the selected day in UTC", () => {
    expect(endOfDayUtcIso("2027-01-15")).toBe(
      new Date("2027-01-15T23:59:59.999Z").toISOString()
    );
  });

  it("returns undefined for empty or invalid input", () => {
    expect(endOfDayUtcIso("")).toBeUndefined();
    expect(endOfDayUtcIso("not-a-date")).toBeUndefined();
  });
});
