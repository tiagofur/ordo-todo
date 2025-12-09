import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CheckSquare,
  FolderKanban,
  Tags,
  BarChart3,
  Briefcase,
  Calendar,
} from "lucide-react";
import { Sidebar as SidebarUI, type NavItem } from "@ordo-todo/ui";
import { useTranslation } from "react-i18next";
import { TimerWidget } from "./timer/TimerWidget";
import { WorkspaceSelector } from "./workspace/WorkspaceSelector";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: t("sidebar.today", "Today"), href: "/", icon: Home, color: "cyan" },
    { name: t("sidebar.tasks", "Tasks"), href: "/tasks", icon: CheckSquare, color: "purple" },
    { name: t("sidebar.calendar", "Calendar"), href: "/calendar", icon: Calendar, color: "blue" },
    { name: t("sidebar.projects", "Projects"), href: "/projects", icon: FolderKanban, color: "pink" },
    { name: t("sidebar.workspaces", "Workspaces"), href: "/workspaces", icon: Briefcase, color: "orange" },
    { name: t("sidebar.tags", "Tags"), href: "/tags", icon: Tags, color: "green" },
    { name: t("sidebar.analytics", "Analytics"), href: "/analytics", icon: BarChart3, color: "cyan" },
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
        settings: t("sidebar.settings", "Settings"),
      }}
    />
  );
}
