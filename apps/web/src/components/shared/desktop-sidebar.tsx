"use client";

import {
  Home,
  CheckSquare,
  FolderKanban,
  BarChart3,
  Briefcase,
  Calendar,
  Download,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Sidebar as SidebarUI, type NavSection } from "@ordo-todo/ui";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { TimerWidget } from "@/components/timer/timer-widget";
import { usePWA } from "@/components/providers/pwa-provider";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCreateWorkspace } from "@/lib/api-hooks";

export function DesktopSidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const createWorkspace = useCreateWorkspace();

  const handleCreateWorkspace = async (data: any) => {
    try {
      await createWorkspace.mutateAsync(data);
      setShowCreateWorkspace(false);
    } catch {
      // Error handled by React Query's onError
    }
  };

  const navSections: NavSection[] = [
    {
      items: [
        { name: t("today"), href: "/dashboard", icon: Home, color: "cyan" },
        { name: t("tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
        { name: t("calendar"), href: "/calendar", icon: Calendar, color: "blue" },
      ],
    },
    {
      label: t("sectionPlan"),
      items: [
        { name: t("projects"), href: "/projects", icon: FolderKanban, color: "pink" },
        { name: t("habits"), href: "/habits", icon: Sparkles, color: "green" },
        { name: t("goals"), href: "/goals", icon: Target, color: "pink" },
      ],
    },
    {
      label: t("sectionInsights"),
      items: [
        { name: t("insights"), href: "/insights", icon: BarChart3, color: "cyan" },
      ],
    },
    {
      label: t("sectionTeam"),
      items: [
        { name: t("workspaces"), href: "/workspaces", icon: Briefcase, color: "orange" },
        { name: t("workload"), href: "/workload", icon: Users, color: "orange" },
      ],
    },
  ];

  return (
    <>
      <SidebarUI
        pathname={pathname}
        navSections={navSections}
        renderLink={({ href, className, children }) => (
          <Link href={href} className={className}>
            {children}
          </Link>
        )}
        renderTimerWidget={() => <TimerWidget />}
        renderWorkspaceSelector={() => (
          <WorkspaceSelector onCreateClick={() => setShowCreateWorkspace(true)} />
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
