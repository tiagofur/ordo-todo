"use client";

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
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { MobileSidebar as MobileSidebarUI, type NavItem } from "@ordo-todo/ui";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { TimerWidget } from "@/components/timer/timer-widget";
import { usePWA } from "@/components/providers/pwa-provider";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const navItems: NavItem[] = [
    { name: t("today"), href: "/dashboard", icon: Home, color: "cyan" },
    { name: t("tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
    { name: t("habits"), href: "/habits", icon: Sparkles, color: "green" },
    { name: t("goals"), href: "/goals", icon: Target, color: "pink" },
    { name: t("calendar"), href: "/calendar", icon: Calendar, color: "blue" },
    { name: t("projects"), href: "/projects", icon: FolderKanban, color: "pink" },
    { name: t("workspaces"), href: "/workspaces", icon: Briefcase, color: "orange" },
    { name: t("tags"), href: "/tags", icon: Tags, color: "green" },
    { name: t("analytics"), href: "/analytics", icon: BarChart3, color: "cyan" },
  ];

  return (
    <>
      <MobileSidebarUI
        open={open}
        onOpenChange={onOpenChange}
        pathname={pathname}
        navItems={navItems}
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
        labels={{
          appName: "Ordo",
          settings: t("settings"),
        }}
      />

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
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
