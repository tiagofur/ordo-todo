"use client";

import { useSearchParams } from "next/navigation";
import { UnifiedTrashView } from "@/components/trash/unified-trash-view";

export default function TasksTrashPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  return (
    <UnifiedTrashView
      defaultTab="tasks"
      initialProjectId={projectId}
      wrapInAppLayout={false}
    />
  );
}
