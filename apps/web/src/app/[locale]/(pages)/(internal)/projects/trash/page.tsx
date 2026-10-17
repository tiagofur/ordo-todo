"use client";

import { useSearchParams } from "next/navigation";
import { UnifiedTrashView } from "@/components/trash/unified-trash-view";

export default function ProjectsTrashPage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") || "";

  return (
    <UnifiedTrashView
      defaultTab="projects"
      initialWorkspaceId={workspaceId}
      wrapInAppLayout={false}
    />
  );
}
