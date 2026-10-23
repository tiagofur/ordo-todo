"use client";

import {
  Home,
  CheckSquare,
  FolderKanban,
  BarChart3,
  Briefcase,
  Calendar,
  CalendarDays,
  Download,
  Sparkles,
  Sunrise,
  Target,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { MobileSidebar as MobileSidebarUI, type NavSection } from "@ordo-todo/ui";
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
import { useIsAdmin } from "@/hooks/use-is-admin";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const { isAdmin } = useIsAdmin();
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
        { name: t("tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
        { name: t("calendar"), href: "/calendar", icon: Calendar, color: "blue" },
        { name: t("dayPlan"), href: "/plan", icon: CalendarDays, color: "cyan" },
        { name: t("ritual"), href: "/ritual", icon: Sunrise, color: "orange" },
      ],
    },
    {
      label: t("sectionPlan"),
      items: [
        { name: t("projects"), href: "/projects", icon: FolderKanban, color: "pink" },
        { name: t("habits"), href: "/habits", icon: Sparkles, color: "emerald" },
        { name: t("goals"), href: "/goals", icon: Target, color: "orange" },
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
        { name: t("workload"), href: "/workload", icon: Users, color: "purple" },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: t("sectionAdmin"),
            items: [
              {
                name: t("admin"),
                href: "/admin",
                icon: ShieldCheck,
                color: "purple" as const,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      <MobileSidebarUI
        open={open}
        onOpenChange={onOpenChange}
        pathname={pathname}
        navSections={navSections}
        LogoIcon={CheckSquare}
        renderLink={({ href, className, children, onClick }) => (
          <Link href={href} className={className} onClick={onClick}>
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
