"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useProjectBySlug } from "@/hooks/use-projects";
import { ProjectDetailView } from "@/components/project/project-detail-view";

export default function WorkspaceProjectDetailPage() {
  const params = useParams();
  const t = useTranslations("ProjectDetail");
  const workspaceSlug = params.slug as string;
  const projectSlug = params.projectSlug as string;

  const { project, isLoading: isLoadingProject } = useProjectBySlug(
    workspaceSlug,
    projectSlug
  );

  return (
    <ProjectDetailView
      project={project}
      isLoadingProject={isLoadingProject}
      breadcrumbs={[
        { label: t("breadcrumbs.workspaces"), href: "/workspaces" },
        { label: workspaceSlug, href: `/workspaces/${workspaceSlug}` },
        { label: project?.name || "..." },
      ]}
      backHref={`/workspaces/${workspaceSlug}`}
      backLabel={t("backToWorkspace")}
      wrapInAppLayout={false}
    />
  );
}
