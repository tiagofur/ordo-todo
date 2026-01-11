import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CheckSquare,
  FolderKanban,
  Tags,
  BarChart3,
  Briefcase,
  Calendar,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { Sidebar as SidebarUI, type NavItem } from "@ordo-todo/ui";
import { useTranslation } from "react-i18next";
import { TimerWidget } from "./timer/TimerWidget";
import { WorkspaceSelector } from "./workspace/WorkspaceSelector";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { t } = (useTranslation as any)();
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: t("Sidebar.today", "Today"), href: "/", icon: Home, color: "cyan" },
    { name: t("Sidebar.tasks", "Tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
    { name: t("Sidebar.habits", "Habits"), href: "/habits", icon: Sparkles, color: "green" },
    { name: t("Sidebar.calendar", "Calendar"), href: "/calendar", icon: Calendar, color: "blue" },
    { name: t("Sidebar.projects", "Projects"), href: "/projects", icon: FolderKanban, color: "pink" },
    { name: t("Sidebar.notes", "Notes"), href: "/notes", icon: StickyNote, color: "yellow" },
    { name: t("Sidebar.workspaces", "Workspaces"), href: "/workspaces", icon: Briefcase, color: "orange" },
    { name: t("Sidebar.tags", "Tags"), href: "/tags", icon: Tags, color: "green" },
    { name: t("Sidebar.analytics", "Analytics"), href: "/analytics", icon: BarChart3, color: "cyan" },
  ];

  return (
    <SidebarUI
      pathname={location.pathname}
      navItems={navItems}
      renderLink={({ href, className, children }) => (
        <Link to={href} className={className}>
          {children}
        </Link>
      )}
      renderTimerWidget={() => <TimerWidget />}
      renderWorkspaceSelector={() => <WorkspaceSelector onCreateClick={() => {}} />}
      labels={{
        appName: "Ordo",
        settings: t("Sidebar.settings", "Settings"),
      }}
    />
  );
}
