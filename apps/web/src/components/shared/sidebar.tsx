"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Home,
  CheckSquare,
  FolderKanban,
  Tags,
  BarChart3,
  Briefcase,
  Calendar,
  Download,
  Sparkles,
  Target,
  MessageSquare,
  Heart,
  Users,
  LayoutGrid,
  Trash2,
  StickyNote,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Sidebar as SidebarUI, type NavItem } from "@ordo-todo/ui";
import { WorkspaceSelector, type WorkspaceSelectorItem } from "@/components/workspace/workspace-selector";
import { useWorkspaces, useCreateWorkspace } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { TimerWidget } from "@/components/timer/timer-widget";
import { usePWA } from "@/components/providers/pwa-provider";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const CreateWorkspaceDialog = dynamic(
  () => import("@/components/workspace/create-workspace-dialog").then((mod) => mod.CreateWorkspaceDialog),
  { ssr: false }
);

export function Sidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const params = useParams();
  const workspaceSlug = params?.slug as string;
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  // Workspace data and state
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const createWorkspace = useCreateWorkspace();

  const handleCreateWorkspace = async (data: any) => {
    try {
      const result = await createWorkspace.mutateAsync(data);

      // Auto-select the newly created workspace
      if (result?.id) {
        setSelectedWorkspaceId(result.id);
      }

      setShowCreateWorkspace(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Convert workspaces to selector items
  const workspaceItems: WorkspaceSelectorItem[] = (workspaces || []).map((ws) => ({
    id: ws.id,
    slug: ws.slug,
    name: ws.name,
    type: ws.type,
    color: ws.color,
    stats: {
      projectCount: ws.stats?.projectCount || 0,
      taskCount: ws.stats?.taskCount || 0,
    },
  }));

  const handleSelectWorkspace = (workspace: WorkspaceSelectorItem) => {
    setSelectedWorkspaceId(workspace.id);
    // Navigate to the selected workspace
    // You can add navigation logic here if needed
  };

  const navItems: NavItem[] = [
    { name: t("today"), href: "/dashboard", icon: Home, color: "cyan" },
    { name: t("tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
    ...(workspaceSlug ? [{
      name: t("notes"),
      href: `/workspaces/${workspaceSlug}/notes`,
      icon: StickyNote,
      color: "yellow" as const
    }] : []),
    { name: t("habits"), href: "/habits", icon: Sparkles, color: "green" },
    { name: t("goals"), href: "/goals", icon: Target, color: "pink" },
    { name: t("calendar"), href: "/calendar", icon: Calendar, color: "blue" },
    {
      name: t("eisenhower"),
      href: "/eisenhower",
      icon: LayoutGrid,
      color: "purple",
    },
    {
      name: t("projects"),
      href: "/projects",
      icon: FolderKanban,
      color: "pink",
    },
    {
      name: t("meetings"),
      href: "/meetings",
      icon: MessageSquare,
      color: "purple",
    },
    { name: t("wellbeing"), href: "/wellbeing", icon: Heart, color: "pink" },
    { name: t("workload"), href: "/workload", icon: Users, color: "orange" },
    {
      name: t("workspaces"),
      href: "/workspaces",
      icon: Briefcase,
      color: "orange",
    },
    { name: t("tags"), href: "/tags", icon: Tags, color: "green" },
    {
      name: t("analytics"),
      href: "/analytics",
      icon: BarChart3,
      color: "cyan",
    },
    {
      name: t("trash"),
      href: "/trash",
      icon: Trash2,
      color: "red",
    },
  ];

  return (
    <>
      <SidebarUI
        pathname={pathname}
        navItems={navItems}
        renderLink={({ href, className, children }) => (
          <Link href={href} className={className}>
            {children}
          </Link>
        )}
        renderTimerWidget={() => <TimerWidget />}
        renderWorkspaceSelector={() => (
          <WorkspaceSelector
            workspaces={workspaceItems}
            selectedWorkspaceId={selectedWorkspaceId}
            isLoading={isLoadingWorkspaces}
            onSelect={handleSelectWorkspace}
            onCreateClick={() => setShowCreateWorkspace(true)}
          />
        )}
        renderInstallButton={() => <InstallPWAButton />}
        showSettingsButton={false}
        labels={{
          appName: "Ordo",
          settings: t("settings"),
        }}
      />

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onSubmit={handleCreateWorkspace}
        isPending={createWorkspace.isPending}
      />
    </>
  );
}

function InstallPWAButton() {
  const t = useTranslations("Sidebar");
  const { isInstallable, installPrompt } = usePWA();

  if (!isInstallable) return null;

  return (
    <button
      onClick={installPrompt}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
    >
      <Download className="h-5 w-5" />
      {t("installApp")}
    </button>
  );
}
