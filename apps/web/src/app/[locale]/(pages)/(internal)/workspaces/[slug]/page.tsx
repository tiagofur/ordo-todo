"use client";

import { useParams, useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { WorkspaceDashboard } from "@/components/workspace/workspace-dashboard";
import { useWorkspaceBySlug } from "@/lib/api-hooks";
import { Button } from "@ordo-todo/ui";
import { useTranslations } from "next-intl";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('WorkspaceDashboard');
  const slug = params.slug as string;
  
  const { data: workspace, isLoading } = useWorkspaceBySlug(slug);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">{t('notFound')}</h2>
        <Button onClick={() => router.push("/workspaces")} className="mt-4">
          {t('backToWorkspaces')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Workspaces", href: "/workspaces" },
          { label: workspace.name },
        ]}
      />

      <WorkspaceDashboard workspace={workspace} />
    </div>
  );
}
