import type { Workspace } from "./types/workspace.types";

// Helper to add tier to workspace objects
export function addTierToWorkspace(workspace: Workspace): Workspace & { tier: string } {
  return {
    ...workspace,
    tier: "FREE", // Default tier for backward compatibility
  };
}
