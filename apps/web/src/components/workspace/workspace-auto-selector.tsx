"use client";

import { useEffect } from "react";
import { useWorkspaces } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Workspace } from "@ordo-todo/api-client";

/**
 * Component that automatically selects a workspace on mount
 * Priority:
 * 1. Previously selected workspace (from localStorage)
 * 2. First workspace in the list
 */
export function WorkspaceAutoSelector() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // Don't do anything if no workspaces exist
    if (!workspaces || workspaces.length === 0) return;

    // If there's already a selected workspace and it exists in the list, keep it
    if (selectedWorkspaceId) {
      const workspaceExists = workspaces.some((w: Workspace) => w.id === selectedWorkspaceId);
      if (workspaceExists) {
        return; // Keep the current selection
      }
    }

    // Otherwise, select the first workspace
    setSelectedWorkspaceId(workspaces[0].id);
  }, [workspaces, isLoading, selectedWorkspaceId, setSelectedWorkspaceId]);

  // This component doesn't render anything
  return null;
}
