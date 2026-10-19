import { useState, useEffect } from "react";
import {
  Home,
  CheckSquare,
  FolderKanban,
  BarChart3,
  Briefcase,
  Calendar,
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
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar as SidebarUI, type NavSection } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "../workspace/WorkspaceSelector";
import { CreateWorkspaceDialog } from "../workspace/CreateWorkspaceDialog";
import { TimerWidget } from "../timer/timer-widget";
import { desktopBridge } from "@/lib/desktop-bridge";

export function Sidebar() {
  const { t } = (useTranslation as any)();
  const location = useLocation();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [platform] = useState<string>(() => desktopBridge.getPlatform());

  // macOS: add padding for traffic lights (48px)
  // Windows/Linux: add padding for custom TitleBar (40px)
  const topPadding = platform === "darwin" ? "pt-12" : "pt-10";

  const navSections: NavSection[] = [
    {
      items: [
        { name: t("Sidebar.today"), href: "/dashboard", icon: Home, color: "cyan" },
        { name: "AI Chat", href: "/ai-chat", icon: Bot, color: "blue" },
        { name: t("Sidebar.tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
        { name: t("Sidebar.calendar"), href: "/calendar", icon: Calendar, color: "blue" },
      ],
    },
    {
      label: t("Sidebar.sectionPlan"),
      items: [
        { name: t("Sidebar.projects"), href: "/projects", icon: FolderKanban, color: "pink" },
        { name: t("Sidebar.habits"), href: "/habits", icon: Sparkles, color: "emerald" },
        { name: t("Sidebar.goals"), href: "/goals", icon: Target, color: "orange" },
        { name: t("Sidebar.notes"), href: "/notes", icon: StickyNote, color: "yellow" },
      ],
    },
    {
      label: t("Sidebar.sectionTeam"),
      items: [
        { name: t("Sidebar.workspaces"), href: "/workspaces", icon: Briefcase, color: "orange" },
        { name: t("Sidebar.workload"), href: "/workload", icon: Users, color: "purple" },
        { name: t("Sidebar.eisenhower"), href: "/eisenhower", icon: LayoutGrid, color: "purple" },
        { name: t("Sidebar.meetings"), href: "/meetings", icon: MessageSquare, color: "purple" },
      ],
    },
    {
      label: t("Sidebar.sectionInsights"),
      items: [
        { name: t("Sidebar.insights") || t("Sidebar.analytics"), href: "/insights", icon: BarChart3, color: "cyan" },
        { name: t("Sidebar.wellbeing"), href: "/wellbeing", icon: Heart, color: "pink" },
        { name: t("Sidebar.tags"), href: "/tags", icon: Tags, color: "green" },
        { name: t("Sidebar.trash"), href: "/trash/tasks", icon: Trash2, color: "red" },
      ],
    },
  ];

  const isMac = desktopBridge.getPlatform() === "darwin" || (typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("mac"));

  return (
    <>
      <SidebarUI
        className="block"
        pathname={location.pathname}
        navSections={navSections}
        safeAreaTop={true}
        renderLink={({ href, className, children }) => (
          <Link to={href} className={className}>
            {children}
          </Link>
        )}
        renderTimerWidget={() => <TimerWidget />}
        renderWorkspaceSelector={() => (
          <WorkspaceSelector onCreateClick={() => setShowCreateWorkspace(true)} />
        )}
        showSettingsButton={true}
        labels={{
          appName: "Ordo",
          settings: t("Sidebar.settings"),
        }}
      />

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </>
  );
}
