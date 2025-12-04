"use client";

import { useParams } from "next/navigation";
import { useProjectBySlug } from "@/hooks/use-projects";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderKanban, List, LayoutDashboard, Clock, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { ProjectBoard } from "@/components/project/project-board";

import { ProjectList } from "@/components/project/project-list";
import { ProjectTimeline } from "@/components/project/project-timeline";

export default function ProjectDetailPage() {
  const params = useParams();
  const t = useTranslations('ProjectDetail');
  
  // params.slug is the workspace slug (from parent route)
  // params.projectSlug is the project slug
  const workspaceSlug = params.slug as string;
  const projectSlug = params.projectSlug as string;

  const { project, isLoading, error } = useProjectBySlug(workspaceSlug, projectSlug);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-2xl font-bold">{t('notFound')}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Workspaces", href: "/workspaces" },
          { label: workspaceSlug, href: `/workspaces/${workspaceSlug}` },
          { label: project.name },
        ]}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${project.color}20`, color: project.color }}
            >
              <FolderKanban className="w-6 h-6" />
            </div>
            {project.name}
          </h1>
          {project.description && (
            <p className="text-muted-foreground ml-14">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            {t('tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            {t('tabs.list')}
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-2">
            <FolderKanban className="w-4 h-4" />
            {t('tabs.board')}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="w-4 h-4" />
            {t('tabs.timeline')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            {t('tabs.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">{t('stats.totalTasks')}</h3>
                <List className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{project.tasksCount || 0}</div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">{t('stats.completedTasks')}</h3>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{project.completedTasksCount || 0}</div>
            </div>
          </div>
        </TabsContent>



        <TabsContent value="list">
          <ProjectList projectId={project.id} />
        </TabsContent>

        <TabsContent value="board">
          <ProjectBoard projectId={project.id} />
        </TabsContent>

        <TabsContent value="timeline">
          <ProjectTimeline projectId={project.id} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <p className="text-muted-foreground text-center py-8">Project Settings Coming Soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
