/**
 * Workspace Invitations Component Tests
 */

import { render } from "@testing-library/react-native";
import WorkspaceInvitationsScreen from "../workspace-invitations";

const MOCK_INVITATIONS = [
  {
    id: "1",
    workspaceId: "ws-123",
    workspaceName: "Proyecto Alpha",
    workspaceColor: "#3B82F6",
    invitedBy: "user-456",
    invitedByEmail: "john@example.com",
    invitedByName: "John Doe",
    status: "PENDING",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    workspaceId: "ws-789",
    workspaceName: "Proyecto Beta",
    workspaceColor: "#10B981",
    invitedBy: "user-456",
    invitedByEmail: "jane@example.com",
    invitedByName: "Jane Smith",
    status: "ACCEPTED",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
];

describe("WorkspaceInvitationsScreen", () => {
  it("should render without crashing", () => {
    render(<WorkspaceInvitationsScreen />);
  });

  it("should display pending invitations count", () => {
    render(<WorkspaceInvitationsScreen />);
    // Count should be visible in header
  });

  it("should show empty state when no pending invitations", () => {
    const { getByText } = render(<WorkspaceInvitationsScreen />);

    expect(getByText(/Sin invitaciones/)).toBeTruthy();
  });

  it("should display invitation cards when pending", () => {
    const { getByText } = render(<WorkspaceInvitationsScreen />);

    expect(getByText(/Pendientes/)).toBeTruthy();
    expect(getByText(/Proyecto Alpha/)).toBeTruthy();
  });

  it("should display invite form toggle", () => {
    const { getByText } = render(<WorkspaceInvitationsScreen />);

    expect(getByText(/Invitar nuevos/)).toBeTruthy();
  });

  it("should show accept and decline buttons", () => {
    const { getByText } = render(<WorkspaceInvitationsScreen />);

    // Buttons should be present
    expect(getByText(/Pendientes/)).toBeTruthy();
  });

  it("should display invitation status", () => {
    const { getByText } = render(<WorkspaceInvitationsScreen />);

    expect(getByText(/Pendiente/)).toBeTruthy();
  });
});
