import { useState } from "react";
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
import { WorkspaceSelector } from "../workspace/WorkspaceSelector";
import { CreateWorkspaceDialog } from "../workspace/CreateWorkspaceDialog";
import { TimerWidget } from "../timer/timer-widget";
import { desktopBridge } from "@/lib/desktop-bridge";

/** Secciones de navegación compartidas por la sidebar fija y el cajón móvil. */
export function useNavSections(): NavSection[] {
  const { t } = (useTranslation as any)();

  // Sistema de color (decisión del owner, oct 2026): el color codifica la
  // sección — purple = trabajo diario, emerald = planificación, orange =
  // equipo y enfoque, cyan = rendimiento — y red se reserva para la Papelera.
  return [
    {
      items: [
        {
          name: t("Sidebar.today"),
          href: "/dashboard",
          icon: Home,
          color: "purple",
        },
        {
          name: t("Sidebar.aiChat"),
          href: "/ai-chat",
          icon: Bot,
          color: "purple",
        },
        {
          name: t("Sidebar.tasks"),
          href: "/tasks",
          icon: CheckSquare,
          color: "purple",
        },
        {
          name: t("Sidebar.calendar"),
          href: "/calendar",
          icon: Calendar,
          color: "purple",
        },
      ],
    },
    {
      label: t("Sidebar.sectionPlan"),
      items: [
        {
          name: t("Sidebar.projects"),
          href: "/projects",
          icon: FolderKanban,
          color: "emerald",
        },
        {
          name: t("Sidebar.habits"),
          href: "/habits",
          icon: Sparkles,
          color: "emerald",
        },
        {
          name: t("Sidebar.goals"),
          href: "/goals",
          icon: Target,
          color: "emerald",
        },
        {
          name: t("Sidebar.notes"),
          href: "/notes",
          icon: StickyNote,
          color: "emerald",
        },
      ],
    },
    {
      label: t("Sidebar.sectionTeam"),
      items: [
        {
          name: t("Sidebar.workspaces"),
          href: "/workspaces",
          icon: Briefcase,
          color: "orange",
        },
        {
          name: t("Sidebar.workload"),
          href: "/workload",
          icon: Users,
          color: "orange",
        },
        {
          name: t("Sidebar.eisenhower"),
          href: "/eisenhower",
          icon: LayoutGrid,
          color: "orange",
        },
        {
          name: t("Sidebar.meetings"),
          href: "/meetings",
          icon: MessageSquare,
          color: "orange",
        },
      ],
    },
    {
      label: t("Sidebar.sectionInsights"),
      items: [
        {
          name: t("Sidebar.insights") || t("Sidebar.analytics"),
          href: "/insights",
          icon: BarChart3,
          color: "cyan",
        },
        {
          name: t("Sidebar.wellbeing"),
          href: "/wellbeing",
          icon: Heart,
          color: "cyan",
        },
        { name: t("Sidebar.tags"), href: "/tags", icon: Tags, color: "cyan" },
        {
          name: t("Sidebar.trash"),
          href: "/trash/tasks",
          icon: Trash2,
          color: "red",
        },
      ],
    },
  ];
}

interface SidebarProps {
  /** Visibilidad por breakpoint; por defecto solo desde `md` (tablet y desktop). */
  className?: string;
}

export function Sidebar({
  className = "hidden md:block pt-[env(safe-area-inset-top)]",
}: SidebarProps) {
  const { t } = (useTranslation as any)();
  const location = useLocation();
  const navSections = useNavSections();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  return (
    <>
      <SidebarUI
        className={className}
        pathname={location.pathname}
        navSections={navSections}
        // Hueco para los semáforos de macOS / TitleBar propia: solo en desktop.
        safeAreaTop={desktopBridge.isDesktop()}
        renderLink={({ href, className, children }) => (
          <Link to={href} className={className}>
            {children}
          </Link>
        )}
        renderTimerWidget={() => <TimerWidget />}
        renderWorkspaceSelector={() => (
          <WorkspaceSelector
            onCreateClick={() => setShowCreateWorkspace(true)}
          />
        )}
        showSettingsButton={false}
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
