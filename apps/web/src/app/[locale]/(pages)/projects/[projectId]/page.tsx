"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useProject } from "@/lib/api-hooks";
import { ProjectDetailView } from "@/components/project/project-detail-view";

export default function ProjectDetailPage() {
  const params = useParams();
  const t = useTranslations("ProjectDetail");
  const projectId = params.projectId as string;
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);

  return (
    <ProjectDetailView
      project={project}
      isLoadingProject={isLoadingProject}
      breadcrumbs={[
        { label: t("breadcrumbs.projects"), href: "/projects" },
        { label: project?.name || "..." },
      ]}
      backHref="/projects"
      backLabel={t("backToProjects")}
      wrapInAppLayout={true}
    />
  );
}
