"use client";

import { useParams, useSearchParams } from "next/navigation";
import { UnifiedTrashView, type TrashTab } from "@/components/trash/unified-trash-view";

export default function TrashTypePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const workspaceId = searchParams.get("workspaceId") || "";

  const type = (params?.type as string) || "tasks";
  const tab: TrashTab =
    type === "projects" || type === "workspaces" || type === "tasks"
      ? (type as TrashTab)
      : "tasks";

  return (
    <UnifiedTrashView
      defaultTab={tab}
      initialProjectId={projectId}
      initialWorkspaceId={workspaceId}
      wrapInAppLayout={true}
    />
  );
}
