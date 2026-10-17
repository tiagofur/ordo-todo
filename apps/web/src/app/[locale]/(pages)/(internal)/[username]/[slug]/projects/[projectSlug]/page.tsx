"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useProjectBySlug } from "@/hooks/use-projects";
import { ProjectDetailView } from "@/components/project/project-detail-view";

export default function UserWorkspaceProjectDetailPage() {
  const params = useParams();
  const t = useTranslations("ProjectDetail");
  const username = params.username as string;
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
        {
          label: workspaceSlug,
          href: `/${username}/${workspaceSlug}`,
        },
        { label: project?.name || "..." },
      ]}
      backHref={`/${username}/${workspaceSlug}`}
      backLabel={t("backToWorkspace")}
      wrapInAppLayout={false}
    />
  );
}
