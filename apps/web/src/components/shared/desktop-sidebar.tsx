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
  Bot,
  StickyNote,
  LayoutGrid,
  MessageSquare,
  Heart,
  Tags,
  Trash2,
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
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";

interface DesktopSidebarProps {
  collapsed?: boolean;
}

export function DesktopSidebar({ collapsed = false }: DesktopSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const createWorkspace = useCreateWorkspace();
  const { setSelectedWorkspaceId } = useWorkspaceStore();

  const handleCreateWorkspace = async (data: any) => {
    try {
      const created = await createWorkspace.mutateAsync(data);
      if (created?.id) {
        setSelectedWorkspaceId(created.id);
      }
      toast.success("Workspace creado exitosamente");
      setShowCreateWorkspace(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Error al crear workspace"));
    }
  };

  const navSections: NavSection[] = [
    {
      items: [
        { name: t("today"), href: "/dashboard", icon: Home, color: "cyan" },
        { name: "AI Chat", href: "/ai-chat", icon: Bot, color: "blue" },
        { name: t("tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
        { name: t("calendar"), href: "/calendar", icon: Calendar, color: "blue" },
      ],
    },
    {
      label: t("sectionPlan"),
      items: [
        { name: t("projects"), href: "/projects", icon: FolderKanban, color: "pink" },
        { name: t("habits"), href: "/habits", icon: Sparkles, color: "emerald" },
        { name: t("goals"), href: "/goals", icon: Target, color: "orange" },
        { name: t("notes"), href: "/notes", icon: StickyNote, color: "yellow" },
      ],
    },
    {
      label: t("sectionTeam"),
      items: [
        { name: t("workspaces"), href: "/workspaces", icon: Briefcase, color: "orange" },
        { name: t("workload"), href: "/workload", icon: Users, color: "purple" },
        { name: t("eisenhower"), href: "/eisenhower", icon: LayoutGrid, color: "purple" },
        { name: t("meetings"), href: "/meetings", icon: MessageSquare, color: "purple" },
      ],
    },
    {
      label: t("sectionInsights"),
      items: [
        { name: t("insights"), href: "/insights", icon: BarChart3, color: "cyan" },
        { name: t("wellbeing"), href: "/wellbeing", icon: Heart, color: "pink" },
        { name: t("tags"), href: "/tags", icon: Tags, color: "green" },
        { name: t("trash"), href: "/trash/tasks", icon: Trash2, color: "red" },
      ],
    },
  ];

  return (
    <>
      <SidebarUI
        pathname={pathname}
        navSections={navSections}
        collapsed={collapsed}
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
        showSettingsButton={true}
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
