import { type ReactNode, type ElementType } from "react";
import {
  Home,
  CheckSquare,
  FolderKanban,
  Tags,
  BarChart3,
  Settings,
  Briefcase,
  Calendar,
} from "lucide-react";
import { cn } from "../../utils/index.js";

export interface NavItem {
  name: string;
  href: string;
  icon: ElementType;
  color?:
    | "cyan"
    | "purple"
    | "pink"
    | "orange"
    | "green"
    | "emerald"
    | "blue"
    | "yellow"
    | "red";
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export interface SidebarProps {
  /** Custom classes to apply to the sidebar aside container */
  className?: string;
  /** Current pathname to determine active state */
  pathname?: string;
  /** Navigation items (flat list) */
  navItems?: NavItem[];
  /** Navigation sections with optional labels (takes precedence over navItems) */
  navSections?: NavSection[];
  /** Render a Link component (for Next.js or React Router) */
  renderLink: (props: {
    href: string;
    className: string;
    children: ReactNode;
  }) => ReactNode;
  /** Render custom header slot above the logo (e.g. for macOS window traffic lights) */
  renderTopHeader?: () => ReactNode;
  /** Whether to add safe area spacing at the top (for macOS traffic lights / window dragging) */
  safeAreaTop?: boolean;
  /** Workspace selector component */
  renderWorkspaceSelector?: () => ReactNode;
  /** Timer widget component */
  renderTimerWidget?: () => ReactNode;
  /** Install PWA button renderer */
  renderInstallButton?: () => ReactNode;
  /** Called when user clicks settings */
  onSettingsClick?: () => void;
  /** Logo click handler or href */
  logoHref?: string;
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
  /** Whether to show the settings button (default: false) */
  showSettingsButton?: boolean;
  labels?: {
    appName?: string;
    settings?: string;
    today?: string;
    tasks?: string;
    calendar?: string;
    projects?: string;
    workspaces?: string;
    tags?: string;
    analytics?: string;
  };
}

// hover: (no group-hover:) porque el color va sobre el propio link: un
// group-hover: en el mismo elemento que lleva .group nunca matchea (selector
// descendiente). El icono hereda el color del link.
const colorClasses: Record<string, string> = {
  cyan: "hover:bg-cyan-50 dark:hover:bg-cyan-950/40 hover:text-cyan-600 dark:hover:text-cyan-400",
  purple:
    "hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400",
  pink: "hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-400",
  orange:
    "hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 dark:hover:text-orange-400",
  green:
    "hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 dark:hover:text-green-400",
  emerald:
    "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400",
  blue: "hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400",
  yellow:
    "hover:bg-yellow-50 dark:hover:bg-yellow-950/40 hover:text-yellow-600 dark:hover:text-yellow-400",
  red: "hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400",
};

// Sombras elegidas para garantizar ≥4.5:1 de contraste con texto blanco (WCAG AA)
const activeColorClasses: Record<string, string> = {
  cyan: "bg-cyan-700 text-white shadow-sm shadow-cyan-700/25 font-semibold",
  purple:
    "bg-purple-600 text-white shadow-sm shadow-purple-600/25 font-semibold",
  pink: "bg-pink-600 text-white shadow-sm shadow-pink-600/25 font-semibold",
  orange:
    "bg-orange-700 text-white shadow-sm shadow-orange-700/25 font-semibold",
  green: "bg-green-700 text-white shadow-sm shadow-green-700/25 font-semibold",
  emerald:
    "bg-emerald-700 text-white shadow-sm shadow-emerald-700/25 font-semibold",
  blue: "bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold",
  yellow:
    "bg-yellow-700 text-white shadow-sm shadow-yellow-700/25 font-semibold",
  red: "bg-red-600 text-white shadow-sm shadow-red-600/25 font-semibold",
};

const DEFAULT_LABELS = {
  appName: "Ordo",
  settings: "Settings",
  today: "Today",
  tasks: "Tasks",
  calendar: "Calendar",
  projects: "Projects",
  workspaces: "Workspaces",
  tags: "Tags",
  analytics: "Analytics",
};

export function Sidebar({
  className,
  pathname = "",
  navItems,
  navSections,
  collapsed = false,
  renderTopHeader,
  safeAreaTop = false,
  renderLink,
  renderWorkspaceSelector,
  renderTimerWidget,
  renderInstallButton,
  logoHref = "/dashboard",
  showSettingsButton = false,
  labels = {},
}: SidebarProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  // Build sections: prefer navSections, fall back to navItems as a single section
  const sections: NavSection[] = navSections || [
    {
      items: navItems || [
        { name: t.today, href: "/dashboard", icon: Home, color: "cyan" },
        { name: t.tasks, href: "/tasks", icon: CheckSquare, color: "purple" },
        { name: t.calendar, href: "/calendar", icon: Calendar, color: "blue" },
        {
          name: t.projects,
          href: "/projects",
          icon: FolderKanban,
          color: "pink",
        },
        {
          name: t.workspaces,
          href: "/workspaces",
          icon: Briefcase,
          color: "orange",
        },
        { name: t.tags, href: "/tags", icon: Tags, color: "green" },
        {
          name: t.analytics,
          href: "/analytics",
          icon: BarChart3,
          color: "cyan",
        },
      ],
    },
  ];

  const isActiveRoute = (href: string) => {
    if (!pathname) return false;

    // Handle Projects routes: /projects, /projects/*, or nested /.../projects/*
    if (href === "/projects") {
      return (
        pathname === "/projects" ||
        pathname.startsWith("/projects/") ||
        pathname.includes("/projects")
      );
    }

    // Handle Workspaces routes:
    // 1. Direct /workspaces or /workspaces/* (excluding nested /projects)
    // 2. User workspace routes like /:username/:slug (excluding reserved top-level and nested /projects)
    if (href === "/workspaces") {
      if (pathname.includes("/projects")) return false;
      if (pathname === "/workspaces" || pathname.startsWith("/workspaces/"))
        return true;

      const segments = pathname
        .replace(/^\//, "")
        .replace(/\/$/, "")
        .split("/");
      const firstSegment = segments[0];
      const reservedTopLevel = [
        "dashboard",
        "tasks",
        "calendar",
        "projects",
        "workspaces",
        "habits",
        "goals",
        "notes",
        "ai-chat",
        "eisenhower",
        "meetings",
        "insights",
        "wellbeing",
        "tags",
        "settings",
        "profile",
        "notifications",
        "reports",
        "timer",
        "trash",
        "login",
        "register",
        "auth",
        "admin",
      ];
      if (
        segments.length === 2 &&
        firstSegment &&
        !reservedTopLevel.includes(firstSegment)
      ) {
        return true;
      }
      return false;
    }

    // Handle Trash routes: /trash, /trash/*, /tasks/trash
    if (href === "/trash" || href.startsWith("/trash")) {
      return (
        pathname === "/trash" ||
        pathname.startsWith("/trash/") ||
        pathname === "/tasks/trash"
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        className !== undefined ? className : "hidden lg:block",
      )}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* macOS / Window controls safe-area drag header */}
        {safeAreaTop && (
          <div
            data-tauri-drag-region
            style={
              {
                WebkitAppRegion: "drag",
                minHeight: "28px",
                height: "max(env(safe-area-inset-top, 0px), 28px)",
              } as React.CSSProperties
            }
            className="h-7 w-full shrink-0 select-none bg-transparent"
          />
        )}
        {/* Top Header slot (e.g. for custom slots) */}
        {renderTopHeader?.()}

        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border/50 shrink-0",
            safeAreaTop ? "h-14" : "h-16",
            collapsed ? "justify-center px-2" : "px-6",
          )}
        >
          {renderLink({
            href: logoHref,
            className: "flex items-center gap-3 group",
            children: (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ad46ff] text-white shadow-md shadow-[#ad46ff]/30 transition-transform duration-300 group-hover:scale-105">
                  <CheckSquare className="h-6 w-6 stroke-[2.2]" />
                </div>
                {!collapsed && (
                  <span className="text-2xl font-bold text-foreground tracking-tight">
                    {t.appName}
                  </span>
                )}
              </>
            ),
          })}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <nav
            role="navigation"
            aria-label="Navegación principal"
            className={cn("py-4", collapsed ? "px-2" : "px-3")}
          >
            {sections.map((section, sectionIndex) => (
              <div
                key={section.label || sectionIndex}
                className={cn(sectionIndex > 0 && "mt-4")}
              >
                {section.label && !collapsed && (
                  <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {section.label}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const itemColor = item.color || "cyan";
                    const activeClass =
                      activeColorClasses[itemColor] || activeColorClasses.cyan;
                    const hoverClass =
                      colorClasses[itemColor] || colorClasses.cyan;

                    return (
                      <div key={item.href}>
                        {renderLink({
                          href: item.href,
                          className: cn(
                            "group flex min-h-11 items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                            collapsed ? "justify-center px-2" : "px-3",
                            isActive
                              ? activeClass
                              : cn("text-muted-foreground", hoverClass),
                          ),
                          children: (
                            <>
                              <item.icon
                                className={cn(
                                  "h-5 w-5 shrink-0 transition-transform duration-200",
                                  isActive
                                    ? "text-white"
                                    : "group-hover:scale-110",
                                )}
                              />
                              {!collapsed && <span>{item.name}</span>}
                            </>
                          ),
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Timer Widget */}
          {renderTimerWidget && !collapsed && (
            <div className="border-t border-sidebar-border/50 p-3">
              {renderTimerWidget()}
            </div>
          )}

          {/* Workspace Selector */}
          {renderWorkspaceSelector && !collapsed && (
            <div className="border-t border-sidebar-border/50 p-3">
              {renderWorkspaceSelector()}
            </div>
          )}

          {/* Settings & PWA */}
          {(showSettingsButton || renderInstallButton) && (
            <div className="border-t border-sidebar-border/50 p-3 space-y-1">
              {showSettingsButton &&
                renderLink({
                  href: "/settings",
                  className: cn(
                    "group flex min-h-11 items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed ? "justify-center px-2" : "px-3",
                    isActiveRoute("/settings")
                      ? activeColorClasses.blue
                      : cn("text-muted-foreground", colorClasses.blue),
                  ),
                  children: (
                    <>
                      <Settings
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-200",
                          isActiveRoute("/settings")
                            ? "text-white"
                            : "group-hover:scale-110",
                        )}
                      />
                      {!collapsed && <span>{t.settings}</span>}
                    </>
                  ),
                })}
              {!collapsed && renderInstallButton?.()}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
